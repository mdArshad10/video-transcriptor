import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { VerifyTokenDto } from './dto/verify-token.dto';
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_COOKIE_NAME,
} from './constants';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) { }

  @Post('verify-token')
  async verifyToken(@Body() dto: VerifyTokenDto, @Res({ passthrough: true }) res: Response) {
    const user = await this.authService.verifyAsymmetricToken(dto.token);

    const accessToken = await this.authService.issueAccessToken(user);
    const { rawToken } =
      await this.authService.createRefreshToken(user);

    return {
      accessToken,
      refreshToken: rawToken,
      user,
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    // Priority: httpOnly cookie → body.refreshToken
    // NOTE: Do NOT fall back to Authorization header — that carries the access token.
    const refreshToken =
      req.cookies?.[REFRESH_TOKEN_COOKIE_NAME] ??
      (req.body as { refreshToken?: string })?.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const { accessToken, refreshToken: nextRefreshToken, user } =
      await this.authService.rotateRefreshToken(refreshToken);

    return {
      accessToken,
      refreshToken: nextRefreshToken,
      user,
    };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

    if (refreshToken) {
      await this.authService.revokeRefreshToken(refreshToken);
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: this.configService.get<string>('NODE_ENV') === 'production',
    });

    return { message: 'Logged out' };
  }
}
