import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, GetObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);

  /**
   * Both properties are `readonly` and initialised once in the constructor.
   * Because NestJS treats providers as singletons by default, this constructor
   * runs exactly ONE time for the lifetime of the application, so there is
   * always exactly one S3Client instance shared across all inject-sites.
   */
  private readonly bucketName: string;
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService) {
    /**
     * WHY THE ERROR?
     * `configService.get<T>(key)` returns `T | undefined` because the key
     * might not exist in the environment. TypeScript rejects assigning
     * `string | undefined` to a field typed as `string`.
     *
     * FIX: use `configService.getOrThrow<T>(key)` — it throws an error at
     * startup if the variable is missing, and its return type is `T` (not
     * `T | undefined`). This is the correct approach: fail fast if the app
     * is misconfigured rather than silently running with undefined values.
     */
    this.bucketName = this.configService.getOrThrow<string>(
      'AWS_S3_SOURCE_BUCKET',
    );

    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>('AWS_S3_REGION'),
      endpoint: this.configService.getOrThrow<string>('AWS_ENDPOINT_URL'),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
      },
    });
  }

  async onModuleInit(): Promise<void | Error | { message: string }> {
    try {
      await this.ensureBucketExists(this.bucketName);

      this.logger.log(`${this.bucketName} is existed`);
    } catch (err: unknown) {
      const error =
        err instanceof Error
          ? err
          : { message: 'Failed to verify that bucket is exist or not' };
      return error;
    }
  }

  /**
   * Generate a short-lived pre-signed GET URL for a given S3 object key.
   * @param storageKey  The S3 object key (e.g. `videos/abc123.mp4`)
   * @param expiresIn   Seconds until the URL expires (default 1 hour)
   */
  async createPutPreSignedUrl(
    storageKey: string,
    expiresIn = 3600,
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: storageKey,
      });

      console.log('Bucket name:', this.bucketName);
      console.log('Storage key:', storageKey);
      const url = await getSignedUrl(this.s3Client, command, { expiresIn });
      console.log('Pre-signed URL:', url);

      return url;
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? error
          : { message: 'failed to create Put PreSigned url' };
      throw err;
    }
  }

  async checkBucketExists(bucketName: string) {
    try {
      await this.s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log('✅ Bucket exists');
      return true;
    } catch (err: any) {
      if (err.name === 'NotFound') {
        console.log('❌ Bucket does not exist');
        return false;
      }
      console.error('⚠️ Error checking bucket:', err);
      return false;
    }
  }

  async createGetPreSignedUrl(
    storageKey: string,
    bucketName: string,
    expiresIn: number,
  ): Promise<string> {
    try {
      if (!bucketName) {
        throw new Error('add the destination bucket name');
      }

      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: storageKey,
      });

      this.logger.debug(
        `Creating GET pre-signed URL for ${bucketName}/${storageKey}`,
      );
      return getSignedUrl(this.s3Client, command, { expiresIn });
    } catch (error: unknown) {
      const err =
        error instanceof Error
          ? error
          : new Error('Failed to create GET pre-signed URL');
      this.logger.error(err.message, err.stack);
      throw err;
    }
  }

  private async ensureBucketExists(bucketName: string): Promise<void> {
    const exists = await this.checkBucketExists(bucketName);
    if (!exists) {
      throw new Error(`Bucket "${bucketName}" does not exist`);
    }

    this.logger.log(`Bucket "${bucketName}" validated on startup`);
  }
}
