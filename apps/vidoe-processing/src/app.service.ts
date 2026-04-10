import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  SQSClient,
  ReceiveMessageCommand,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import { ConfigService } from '@nestjs/config';
import { createWriteStream, readdirSync, readFileSync } from "fs";
import { exec } from "child_process";
import { promisify } from "util";
import * as path from "path";
import * as fs from "fs";

const execAsync = promisify(exec);



@Injectable()
export class AppService implements OnModuleInit {
  private readonly sqsClient: SQSClient;
  private readonly s3Client: S3Client;
  private readonly queueUrl: string;

  constructor(
    private readonly configService: ConfigService,
  ) {
    this.sqsClient = new SQSClient({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      endpoint: this.configService.getOrThrow<string>('AWS_ENDPOINT_URL'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });
    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_REGION'),
      endpoint: this.configService.getOrThrow<string>('AWS_ENDPOINT_URL'),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>('AWS_SECRET_ACCESS_KEY'),
      },
    });

    this.queueUrl = this.configService.getOrThrow<string>('AWS_SQS_QUEUE_URL');
  }

  async onModuleInit() {
    console.log('Starting SQS Poller...');
    this.pollQueue();
  }

  private async pollQueue() {
    while (true) {
      try {
        const command = new ReceiveMessageCommand({
          QueueUrl: this.queueUrl,
          MaxNumberOfMessages: 1,
          WaitTimeSeconds: 20,
        });


        const response = await this.sqsClient.send(command);

        if (!response.Messages) {
          continue;
        }

        for (const msg of response.Messages) {
          if (!msg.Body) continue;
          const body = JSON.parse(msg.Body);
          const record = body.Records?.[0];

          const bucket = record?.s3?.bucket?.name;
          const key = record?.s3?.object?.key;

          console.log('Processing:', bucket, key);

          await this.processVideo(bucket, key);

          await this.sqsClient.send(
            new DeleteMessageCommand({
              QueueUrl: this.queueUrl,
              ReceiptHandle: msg.ReceiptHandle!,
            }),
          );
        }

      } catch (error) {
        console.error('Error polling SQS:', error);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  }



  createMasterPlaylist(outputDir: string) {
    const master = `#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=3000000,RESOLUTION=1280x720
720p.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=854x480
480p.m3u8
`;

    fs.writeFileSync(`${outputDir}/master.m3u8`, master);
  }

  private async processVideo(bucket: string, key: string) {
    try {

      // 4. Upload processed files

      const videoId = key.split("/")[1]; // adjust if needed

      const inputPath = `/tmp/${videoId}-input.mp4`;
      const outputDir = `/tmp/${videoId}-hls`;

      // 1. Download file from S3 and save locally (/tmp/input.mp4)
      console.log("Step 1: Downloading from S3...");
      await this.downloadFromS3(bucket, key, inputPath);

      // 2. Run FFmpeg
      console.log("Step 2: Running FFmpeg...");
      await this.runFFmpeg(inputPath, outputDir);

      // 🔥 ADD HERE (RIGHT AFTER FFMPEG)
      console.log("Step 3: Creating master playlist...");
      this.createMasterPlaylist(outputDir);

      // 3. Upload HLS to S3
      console.log("Step 4: Uploading HLS to S3...");
      await this.uploadFolderToS3(bucket, outputDir, `videos/${videoId}/hls`);

      console.log("Step 5: Cleanup");

    } catch (error) {
      console.error('Error processing message:', error);
    }
  }

  // ------------------------
  // Download
  // ------------------------
  async downloadFromS3(bucket: string, key: string, outputPath: string) {
    const res = await this.s3Client.send(
      new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );

    return new Promise<void>((resolve, reject) => {
      const writeStream = createWriteStream(outputPath);
      const body = res.Body as any;
      body.pipe(writeStream);
      body.on("error", reject);
      writeStream.on("finish", () => resolve());
    });
  }

  // ------------------------
  // FFmpeg Processing
  // ------------------------
  async runFFmpeg(input: string, outputDir: string) {
    const cmd = `
      mkdir -p ${outputDir} &&
      ffmpeg -i ${input} \
      -filter_complex "[0:v]split=2[v1][v2];[v1]scale=1280:720[v1out];[v2]scale=854:480[v2out]" \
      -map "[v1out]" -map 0:a \
      -c:v:0 libx264 -b:v:0 3000k \
      -hls_time 6 -hls_playlist_type vod \
      -hls_segment_filename "${outputDir}/720p_%03d.ts" ${outputDir}/720p.m3u8 \
      -map "[v2out]" -map 0:a \
      -c:v:1 libx264 -b:v:1 1500k \
      -hls_time 6 -hls_playlist_type vod \
      -hls_segment_filename "${outputDir}/480p_%03d.ts" ${outputDir}/480p.m3u8
    `;

    await execAsync(cmd);
  }

  // ------------------------
  // Upload Folder
  // ------------------------
  async uploadFolderToS3(
    bucket: string,
    folderPath: string,
    s3Prefix: string
  ) {
    const files = readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const fileContent = readFileSync(filePath);

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: `${s3Prefix}/${file}`,
          Body: fileContent,
        })
      );

      console.log("Uploaded:", file);
    }
  }
}
