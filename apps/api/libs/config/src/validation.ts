import * as Yup from "yup";

const validationSchema = Yup.object({
  NODE_ENV: Yup.string().required(),
  PORT: Yup.number().required(),
  MONGO_URI: Yup.string().required(),
  AWS_ENDPOINT_URL: Yup.string().required(),
  AWS_DEFAULT_REGION: Yup.string().required(),
  AWS_ACCESS_KEY_ID: Yup.string().required(),
  AWS_SECRET_ACCESS_KEY: Yup.string().required(),
  AWS_S3_REGION: Yup.string().required(),
  AWS_S3_BUCKET_NAME: Yup.string().required(),
  AWS_SQS_VIDEO_PROCESSING_COMPLETED_QUEUE_URL: Yup.string().required(),
  AWS_VIDEO_BASE_URL: Yup.string().optional(),
});

export default validationSchema;