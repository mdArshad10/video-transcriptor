import * as Yup from "yup";

const validationSchema = Yup.object({
  NODE_ENV: Yup.string().required(),
  PORT: Yup.number().required(),
  AWS_ENDPOINT_URL: Yup.string().required(),
  AWS_REGION: Yup.string().required(),
  AWS_ACCESS_KEY_ID: Yup.string().required(),
  AWS_SECRET_ACCESS_KEY: Yup.string().required(),
  AWS_SQS_QUEUE_URL: Yup.string().required(),
  PROCESSING_DIR: Yup.string().optional(),
  AWS_S3_PROCESSED_VIDEO_BUCKET_NAME:Yup.string().required(),
});

export default validationSchema;
