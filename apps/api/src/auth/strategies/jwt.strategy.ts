import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthUser } from '../interfaces/auth-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET') || 'dev-lms-access-secret',
      algorithms: ['HS256'],
    });
  }

  validate(payload: AuthUser): AuthUser {
    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid access token payload');
    }

    return {
      sub: payload.sub,
      vendorId: payload.vendorId,
      role: payload.role,
    };
  }
}
