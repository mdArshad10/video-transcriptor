# shadcn/ui monorepo template

This is a Vite monorepo template with shadcn/ui.

## Adding components

To add components to your app, run the following command at the root of your `web` app:

```bash
pnpm dlx shadcn@latest add button -c apps/web
```

This will place the ui components in the `packages/ui/src/components` directory.

## Using components

To use the components in your app, import them from the `ui` package.

```tsx
import { Button } from "@workspace/ui/components/button";
```

Set to setup the localstack for aws emulator
```
aws s3 mb s3://hsl --endpoint-url http://localhost:4566

aws sqs create-queue --queue-name video-processing --endpoint-url http://localhost:4566

aws sqs create-queue --queue-name video-processing-completed --endpoint-url http://localhost:4566

aws s3api put-bucket-cors \
  --bucket hsl \
  --cors-configuration file://cors.json \
  --endpoint-url http://localhost:4566

aws s3api put-bucket-notification-configuration \
  --bucket hsl \
  --notification-configuration file://update-notification.json \
  --endpoint-url http://localhost:4566

aws sqs set-queue-attributes \
  --queue-url http://localhost:4566/000000000000/video-processing \
  --attributes file://policy.json \
  --endpoint-url http://localhost:4566

aws sqs set-queue-attributes \
  --queue-url http://localhost:4566/000000000000/video-processing-completed \
  --attributes file://video-completeing-policy.json \
  --endpoint-url http://localhost:4566
```