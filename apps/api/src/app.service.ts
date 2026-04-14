import {
  DeleteMessageCommand,
  ReceiveMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Video, VideoDocument } from '@app/database';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);
  private readonly sqsClient: SQSClient;
  private readonly queueUrl: string;
  private readonly hlsBaseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Video.name)
    private readonly videoModel: Model<VideoDocument>,
  ) {
    this.sqsClient = new SQSClient({
      region: this.configService.getOrThrow<string>('AWS_DEFAULT_REGION'),
      endpoint: this.configService.getOrThrow<string>('AWS_ENDPOINT_URL'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.queueUrl = this.configService.getOrThrow<string>(
      'AWS_SQS_VIDEO_PROCESSING_COMPLETED_QUEUE_URL',
    );
    this.hlsBaseUrl =
      this.configService.get<string>('AWS_VIDEO_BASE_URL')?.replace(/\/+$/, '') ?? '';
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

          await this.processProcessedVideoKey(decodeURIComponent(key.replace(/\+/g, ' ')));

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
    const hlsMasterUrl = this.buildPlaybackUrl(key);

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

    await this.videoModel.updateOne(
      { _id: video._id, status: { $ne: 'READY' } },
      {
        $set: {
          hls_Master_Url: hlsMasterUrl,
          status: 'READY',
        },
      },
    );

    this.logger.log(`Marked video ${video._id} as READY`);
  }

  private buildPlaybackUrl(key: string) {
    if (this.hlsBaseUrl) {
      return `${this.hlsBaseUrl.replace(/\/+$/, '')}/${key}`;
    }

    const bucket = this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
    const endpoint = this.configService.getOrThrow<string>('AWS_ENDPOINT_URL').replace(/\/+$/, '');
    return `${endpoint}/${bucket}/${key}`;
  }
}
