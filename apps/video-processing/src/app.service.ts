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
import * as path from "path";
import * as fs from "fs";
import { spawn } from "child_process";



@Injectable()
export class AppService implements OnModuleInit {
  private readonly sqsClient: SQSClient;
  private readonly s3Client: S3Client;
  private readonly queueUrl: string;
  private readonly processingDir: string;

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
    this.processingDir = this.resolveProcessingDir();
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

  private resolveProcessingDir() {
    const configuredDir = this.configService.get<string>('PROCESSING_DIR');

    if (configuredDir) {
      return configuredDir;
    }

    if (fs.existsSync('/data')) {
      return '/data';
    }

    return path.resolve(process.cwd(), 'worker-data');
  }

  private async processVideo(bucket: string, key: string) {
    const parts = key?.split('/')
    const videoId = parts[4]; // adjust if needed
    const courseId = parts[2];
    const inputPath = path.join(this.processingDir, `${videoId}-input.mp4`);
    const outputDir = path.join(this.processingDir, `${videoId}-hls`);
    const s3_destination_bucket = this.configService.getOrThrow<string>(
      'AWS_S3_DESTINATION_BUCKET',
    );

    try {
      // 1. Download file from S3 and save locally
      console.log("Step 1: Downloading from S3...");
      await this.downloadFromS3(bucket, key, inputPath);

      // 2. Run FFmpeg
      console.log("Step 2: Running FFmpeg...");
      await this.runFFmpeg(inputPath, outputDir);

      // 🔥 ADD HERE (RIGHT AFTER FFMPEG)
      console.log("Step 3: Creating master playlist...");
      this.createMasterPlaylist(outputDir);


      const s3Prefix = `processed/courses/${courseId}/videos/${videoId}`;

      // 3. Upload HLS to S3
      console.log("Step 4: Uploading HLS to S3...");
      await this.uploadFolderToS3(s3_destination_bucket, outputDir, s3Prefix);

      console.log("Step 5: Cleanup");
    } catch (error) {
      console.error('Error processing message:', error);
    } finally {
      this.cleanupFiles(inputPath, outputDir);
    }
  }

  private cleanupFiles(inputPath: string, outputDir: string) {
    if (fs.existsSync(inputPath)) {
      fs.rmSync(inputPath, { force: true });
    }

    if (fs.existsSync(outputDir)) {
      fs.rmSync(outputDir, { recursive: true, force: true });
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
      fs.mkdirSync(path.dirname(outputPath), { recursive: true });
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
    return new Promise<void>((resolve, reject) => {
      // ensure folder exists
      fs.mkdirSync(outputDir, { recursive: true });

      const args = [
        "-i", input,
        "-filter_complex",
        "[0:v]split=2[v1][v2];[v1]scale=1280:720[v1out];[v2]scale=854:480[v2out]",

        // 720p
        "-map", "[v1out]",
        "-map", "0:a?",
        "-c:v:0", "libx264",
        "-b:v:0", "3000k",
        "-hls_time", "6",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", `${outputDir}/720p_%03d.ts`,
        `${outputDir}/720p.m3u8`,

        // 480p
        "-map", "[v2out]",
        "-map", "0:a?",
        "-c:v:1", "libx264",
        "-b:v:1", "1500k",
        "-hls_time", "6",
        "-hls_playlist_type", "vod",
        "-hls_segment_filename", `${outputDir}/480p_%03d.ts`,
        `${outputDir}/480p.m3u8`,
      ];

      const ffmpeg = spawn("ffmpeg", args);

      ffmpeg.stderr.on("data", (data) => {
        console.log("FFmpeg:", data.toString());
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          console.log("✅ FFmpeg finished");
          resolve();
        } else {
          reject(new Error(`FFmpeg exited with code ${code}`));
        }
      });

      ffmpeg.on("error", (err) => {
        reject(err);
      });
    });
  }

  // ------------------------
  // Upload Folder
  // ------------------------
  async uploadFolderToS3(
    bucket: string,
    folderPath: string,
    s3Prefix: string
  ) {
    const files = readdirSync(folderPath).filter((file) =>
      fs.statSync(path.join(folderPath, file)).isFile(),
    );

    // make the upload the in order
    const segmentFiles = files
      .filter((file) => file.endsWith(".ts"))
      .sort();
    const variantPlaylists = files
      .filter((file) => file.endsWith(".m3u8") && file !== "master.m3u8")
      .sort();
    const masterPlaylist = files.filter((file) => file === "master.m3u8");
    const uploadOrder = [
      ...segmentFiles,
      ...variantPlaylists,
      ...masterPlaylist,
    ];

    for (const file of uploadOrder) {
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
