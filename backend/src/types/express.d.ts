import { UserJwtPayload } from '../auth/types/user-jwt-payload.interface';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserJwtPayload;
  }
}
