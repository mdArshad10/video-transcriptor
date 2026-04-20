import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { RefreshToken, RefreshTokenDocument } from '@app/database';
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL_DAYS,
} from './constants';
import {
  AuthUser,
  GatewayTokenPayload,
} from './interfaces/auth-user.interface';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshTokenDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) { }

  private normalizeMultilineKey(key: string | undefined): string {
    return (key || '').replace(/\\n/g, '\n').trim();
  }

  async verifyAsymmetricToken(token: string): Promise<AuthUser> {
    try {

      this.logger.log('this token is ')
      this.logger.log(token)
      this.logger.log(this.configService.get<string>('JWT_PRIVATE_KEY'));
      const publicKey = this.normalizeMultilineKey(
        this.configService.get<string>('JWT_PRIVATE_KEY'));
      const payload = await this.jwtService.verifyAsync(token, {
        algorithms: ['RS256'],
        publicKey,
      });
      this.logger.log(payload);

      const sub = payload.sub || payload.userId;
      if (!sub) {
        throw new UnauthorizedException('Missing user id');
      }

      return {
        sub,
        vendorId: payload.vendorId,
        role: payload.role,
      };
    } catch (error) {
      this.logger.error(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  async issueAccessToken(user: AuthUser): Promise<string> {
    const accessTokenTtl =
      this.configService.get<string>('JWT_ACCESS_TTL') || ACCESS_TOKEN_TTL;

    return this.jwtService.signAsync(
      {
        sub: user.sub,
        vendorId: user.vendorId,
        role: user.role,
      },
      {
        secret:
          this.configService.get<string>('JWT_ACCESS_SECRET') ||
          'dev-lms-access-secret',
        algorithm: 'HS256',
        expiresIn: accessTokenTtl as any,
      },
    );
  }

  async createRefreshToken(
    user: AuthUser,
  ): Promise<{ rawToken: string }> {
    const tokenId = new mongoose.Types.ObjectId();
    const tokenSecret = randomBytes(40).toString('hex');
    // rawToken is what we send to the client — it contains the un-hashed secret
    const rawToken = `${tokenId}.${tokenSecret}`;
    // hashedToken is what we store in the DB — never store the raw secret
    const hashedToken = await bcrypt.hash(rawToken, 10);

    const expiresAt = new Date();
    expiresAt.setDate(
      expiresAt.getDate() +
      (this.configService.get<number>('REFRESH_TOKEN_TTL_DAYS') ||
        REFRESH_TOKEN_TTL_DAYS),
    );

    await this.refreshTokenModel.create({
      _id: tokenId,
      user_id: user.sub,
      vendor_id: user.vendorId ?? null,
      role: user.role ?? null,
      hashed_token: hashedToken,
      expires_at: expiresAt,
      is_revoked: false,
    });

    // Return rawToken — the client sends this back on /auth/refresh
    return { rawToken };
  }

  parseRefreshToken(rawToken: string): { tokenId: string } {
    const [tokenId] = rawToken.split('.');
    if (!tokenId) {
      throw new UnauthorizedException('Malformed refresh token');
    }

    return { tokenId };
  }

  async rotateRefreshToken(
    rawToken: string,
  ): Promise<{
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const { tokenId } = this.parseRefreshToken(rawToken);

    // Query by _id (the ObjectId we stored as `_id` in createRefreshToken)
    const existingToken = await this.refreshTokenModel.findOne({
      _id: tokenId,
    });
    if (!existingToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existingToken.is_revoked) {
      await this.revokeAllRefreshTokensForUser(existingToken.user_id);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const isMatch = await bcrypt.compare(rawToken, existingToken.hashed_token);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (existingToken.expires_at.getTime() <= Date.now()) {
      existingToken.is_revoked = true;
      existingToken.revoked_at = new Date();
      await existingToken.save();
      throw new UnauthorizedException('Refresh token expired');
    }

    existingToken.is_revoked = true;
    existingToken.revoked_at = new Date();
    await existingToken.save();

    const user: AuthUser = {
      sub: existingToken.user_id,
      vendorId: existingToken.vendor_id ?? undefined,
      role: existingToken.role ?? undefined,
    };

    const accessToken = await this.issueAccessToken(user);
    const { rawToken: refreshToken } =
      await this.createRefreshToken(user);

    return {
      user,
      accessToken,
      refreshToken,

    };
  }

  async revokeRefreshToken(rawToken: string): Promise<void> {
    const { tokenId } = this.parseRefreshToken(rawToken);
    await this.refreshTokenModel.updateOne(
      { _id: tokenId },
      { $set: { is_revoked: true, revoked_at: new Date() } },
    );
  }

  async revokeAllRefreshTokensForUser(userId: string): Promise<void> {
    await this.refreshTokenModel.updateMany(
      { user_id: userId, is_revoked: false },
      { $set: { is_revoked: true, revoked_at: new Date() } },
    );
  }
}
