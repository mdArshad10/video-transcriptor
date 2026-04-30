import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type RefreshTokenDocument = HydratedDocument<RefreshToken>;

@Schema({
  collection: 'refresh_tokens',
  timestamps: { createdAt: 'created_at', updatedAt: false },
})
export class RefreshToken {

  @Prop({ type: String, required: true, index: true })
  user_id: string;

  @Prop({ type: String, default: null })
  vendor_id: string | null;

  @Prop({ type: String, default: null })
  role: string | null;

  @Prop({ type: String, required: true })
  hashed_token: string;

  @Prop({ type: Date, required: true, index: true })
  expires_at: Date;

  @Prop({ type: Boolean, default: false, index: true })
  is_revoked: boolean;

  @Prop({ type: Date, default: null })
  revoked_at: Date | null;

  created_at: Date;
}

export const RefreshTokenSchema = SchemaFactory.createForClass(RefreshToken);

RefreshTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

