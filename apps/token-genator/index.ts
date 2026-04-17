import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt';

const app = express();
const PORT = Number(process.env.PORT || 5000);

const normalizePem = (value?: string): string => (value || '').replace(/\\n/g, '\n').trim();

const JWT_PRIVATE_KEY = normalizePem(process.env.JWT_PRIVATE_KEY);
const JWT_PUBLIC_KEY = normalizePem(process.env.JWT_PUBLIC_KEY);

if (!JWT_PRIVATE_KEY || !JWT_PUBLIC_KEY) {
  throw new Error('JWT_PRIVATE_KEY and JWT_PUBLIC_KEY are required in environment variables.');
}

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_PUBLIC_KEY,
      algorithms: ['RS256'],
      ignoreExpiration: false,
    },
    (payload, done) => done(null, payload),
  ),
);

app.use(passport.initialize());

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'token-genator is running',
    timestamp: new Date().toISOString(),
  });
});

app.get("/create-asymmetric-token", (_req, res) => {
  const payload = {
    sub: "user-123",
    userId: "user-123",
    vendorId: "vendor-001",
    role: "student",
    email: "mock-user@example.com",
  }

  const token = jwt.sign(payload, JWT_PRIVATE_KEY, {
    algorithm: "RS256", // ✅ FIXED
    expiresIn: "10h",
    issuer: "token-genator",
    audience: "lms-service",
  })

  res.status(200).json({
    success: true,
    message: "asymmetric token created",
    token,
    payload,
    algorithm: "RS256",
  })
})

app.listen(PORT, () => {
  console.log(`Token generator server running on http://localhost:${PORT}`);
  console.log(`Health endpoint: http://localhost:${PORT}/health`);
  console.log(`Token endpoint: http://localhost:${PORT}/create-asymmetric-token`);
});
