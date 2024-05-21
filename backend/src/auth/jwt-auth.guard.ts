import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('Incoming request:', request.method, request.url);

    return super.canActivate(context) as boolean;
  }

  handleRequest(err, user) {
    if (err) {
      console.error('JWT authentication error:', err);
      throw err;
    }

    if (!user) {
      console.error('JWT authentication failed: User not found');
      throw new UnauthorizedException('Invalid token');
    }

    console.log('Authenticated user:', user.username);
    return user;
  }
}
