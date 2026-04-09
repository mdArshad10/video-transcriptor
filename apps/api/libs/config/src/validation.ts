import * as Yup from "yup";

const validationSchema = Yup.object({
    NODE_ENV: Yup.string().required(),
    PORT: Yup.number().required(),
    MONGO_URI: Yup.string().required(),
    AWS_ENDPOINT_URL: Yup.string().required(),
    AWS_DEFAULT_REGION: Yup.string().required(),
    AWS_ACCESS_KEY_ID: Yup.string().required(),
    AWS_SECRET_ACCESS_KEY: Yup.string().required(),
})

export default validationSchema;