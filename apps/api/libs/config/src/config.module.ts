import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import validationSchema from './validation';

@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: (config) => {
        try {
            // Yup's validation is usually async via .validate(), but NestJS config expects a synchronous return.
            // validateSync returns the validated and transformed object, or throws an error.
            return validationSchema.validateSync(config, { abortEarly: false, stripUnknown: false });
        } catch (error) {
            console.error('Config validation error:', error.errors);
            throw error;
        }
      },
    })
  ],
  exports: [NestConfigModule]
})
export class ConfigModule { }
