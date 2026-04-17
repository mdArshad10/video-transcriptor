import * as Yup from 'yup';

const validationSchema = Yup.object({
  NODE_ENV: Yup.string().required(),
  PORT: Yup.number().required(),
  MONGO_URI: Yup.string().required(),
  AWS_ENDPOINT_URL: Yup.string().required(),
  AWS_DEFAULT_REGION: Yup.string().required(),
  AWS_ACCESS_KEY_ID: Yup.string().required(),
  AWS_SECRET_ACCESS_KEY: Yup.string().required(),
  AWS_S3_REGION: Yup.string().required(),
  AWS_S3_SOURCE_BUCKET: Yup.string().required(),
  AWS_S3_DESTINATION_BUCKET: Yup.string().required(),
  AWS_SQS_VIDEO_PROCESSING_COMPLETED_QUEUE_URL: Yup.string().required(),
  AWS_VIDEO_BASE_URL: Yup.string().optional(),
  // AWS_GET_PRE_SIGNED_EXPIRE_DAYS: Yup.number().required().positive(),

  // CLOUDFRONT_DOMAIN: Yup.string().required(),
  // CLOUDFRONT_KEY_PAIR_ID: Yup.string().required(),
  // CLOUDFRONT_PRIVATE_KEY: Yup.string().required(),

  JWT_PRIVATE_KEY: Yup.string().required(),
  JWT_ACCESS_SECRET: Yup.string().required(),
  JWT_ACCESS_TTL: Yup.string().required(),
  REFRESH_TOKEN_TTL_DAYS: Yup.string().required(),
});

export default validationSchema;
