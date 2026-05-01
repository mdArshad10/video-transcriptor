import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Course, CourseDocument, Video, VideoDocument } from '@app/database';
import { StorageService } from './lms/storage/storage.service';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private readonly sqsClient: SQSClient;
  private readonly s3Client: S3Client;
  private readonly queueUrl: string;
  private readonly hlsBaseUrl: string;
  private readonly destinationBucket: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly storageService: StorageService,
    @InjectModel(Video.name)
    private readonly videoModel: Model<VideoDocument>,
    @InjectModel(Course.name)
    private readonly courseModel: Model<CourseDocument>,
  ) {
    const region = this.configService.getOrThrow<string>('AWS_DEFAULT_REGION');
    const endpoint = this.configService.getOrThrow<string>('AWS_ENDPOINT_URL');
    const accessKeyId =
      this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.getOrThrow<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    this.sqsClient = new SQSClient({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });

    this.s3Client = new S3Client({
      region,
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
    });

    this.queueUrl = this.configService.getOrThrow<string>(
      'AWS_SQS_VIDEO_PROCESSING_COMPLETED_QUEUE_URL',
    );
    this.destinationBucket = this.configService.getOrThrow<string>(
      'AWS_S3_DESTINATION_BUCKET',
    );
    this.hlsBaseUrl =
      this.configService
        .get<string>('AWS_VIDEO_BASE_URL')
        ?.replace(/\/+$/, '') ?? '';
  }

  onModuleInit() {
    this.logger.log('Starting video status worker');
    void this.pollQueue();
  }

  getHello(): string {
    return 'Hello World!';
  }

  private async pollQueue() {
    while (true) {
      try {
        const response = await this.sqsClient.send(
          new ReceiveMessageCommand({
            QueueUrl: this.queueUrl,
            MaxNumberOfMessages: 1,
            WaitTimeSeconds: 20,
          }),
        );

        if (!response.Messages?.length) {
          continue;
        }

        for (const message of response.Messages) {
          if (!message.Body) {
            continue;
          }

          const body = JSON.parse(message.Body);
          const record = body.Records?.[0];
          const key = record?.s3?.object?.key;

          if (!key) {
            continue;
          }

          const decodedKey = decodeURIComponent(key.replace(/\+/g, ' '));
          await this.processProcessedVideoKey(decodedKey);

          if (message.ReceiptHandle) {
            await this.sqsClient.send(
              new DeleteMessageCommand({
                QueueUrl: this.queueUrl,
                ReceiptHandle: message.ReceiptHandle,
              }),
            );
          }
        }
      } catch (error) {
        this.logger.error('Error polling video worker queue', error);
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  }

  private async processProcessedVideoKey(key: string) {
    const parts = key.split('/');

    if (
      parts.length < 6 ||
      parts[0] !== 'processed' ||
      parts[1] !== 'courses' ||
      parts[3] !== 'videos' ||
      parts[5] !== 'master.m3u8'
    ) {
      this.logger.debug(`Ignoring non-master playlist key: ${key}`);
      return;
    }

    const courseId = parts[2];
    const storageVideoId = parts[4];
    // const hlsMasterUrl = await this.buildPlaybackUrl(key);

    const video = await this.videoModel
      .findOne({
        course_id: new Types.ObjectId(courseId),
        raw_storage_key: { $regex: `/videos/${storageVideoId}/` },
      })
      .select('_id status raw_storage_key')
      .lean();

    if (!video) {
      this.logger.warn(`No video found for processed key: ${key}`);
      return;
    }

    if (video.status === 'READY') {
      this.logger.debug(`Video ${video._id} already READY, skipping`);
      return;
    }

    // Fetch metadata.json for duration
    let durationSeconds: number = 0;
    try {
      const metadata = await this.getMetadataFromS3(
        key.replace('master.m3u8', 'metadata.json'),
      );
      this.logger.log(metadata);
      if (typeof metadata?.duration_seconds === 'number') {
        durationSeconds = metadata?.duration_seconds;
      }
    } catch (error) {
      this.logger.warn(
        `No metadata.json found for ${key}, duration will be 0`,
      );
    }

    await this.videoModel.updateOne(
      { _id: video._id, status: { $ne: 'READY' } },
      {
        $set: {
          hls_Master_Url: key,
          status: 'READY',
          duration_seconds: durationSeconds,
        },
      },
    );

    await this.courseModel.findByIdAndUpdate(
      courseId,
      {
        $inc: {
          total_duration_seconds: durationSeconds,
          video_count: 1,
        },
      },
      { new: true },
    );

    this.logger.log(`Marked video ${video._id} as READY`);
  }

  private async getMetadataFromS3(key: string): Promise<any> {
    const res = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: this.destinationBucket,
        Key: key,
      }),
    );
    const body = await res.Body?.transformToString();
    this.logger.log(body);
    if (!body) {
      throw new Error('Empty metadata file');
    }
    return JSON.parse(body);
  }

  private async buildPlaybackUrl(key: string) {
    const bucket = this.configService.getOrThrow<string>(
      'AWS_S3_DESTINATION_BUCKET',
    );
    // const expiresIn =
    //   Number(this.configService.get<string>('AWS_GET_PRE_SIGNED_EXPIRE_DAYS')) * 24 *60 * 60;
    // return this.storageService.createGetPreSignedUrl(key, bucket, expiresIn);
    if (this.hlsBaseUrl) {
      return `${this.hlsBaseUrl.replace(/\/+$/, '')}/${key}`;
    }

    const endpoint = this.configService
      .getOrThrow<string>('AWS_ENDPOINT_URL')
      .replace(/\/+$/, '');
    return `${endpoint}/${bucket}/${key}`;
  }
}
