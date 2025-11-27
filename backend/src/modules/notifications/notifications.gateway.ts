import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*', // tighten in prod
    credentials: true,
  },
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(private readonly jwtService: JwtService) {}

  /**
   * When a client connects we expect a JWT:
   * - either in socket.handshake.auth.token (recommended)
   * - or in socket.handshake.headers.authorization ("Bearer ...")
   */
  async handleConnection(socket: Socket) {
    try {
      const token =
        (socket.handshake?.auth as any)?.token ||
        (socket.handshake?.headers?.authorization || '').replace(
          /^Bearer\s+/i,
          '',
        );

      if (!token) {
        this.logger.warn(`Socket rejected (no token) id=${socket.id}`);
        socket.disconnect(true);
        return;
      }

      // verify token (throws if invalid)
      const payload = this.jwtService.verify(token);

      // attach user info on socket for later use
      // ensure your JWT payload contains user id as sub or userId
      const userId = (payload.sub || payload.userId) as string;
      if (!userId) {
        this.logger.warn(
          `Socket rejected (no userId in token) id=${socket.id}`,
        );
        socket.disconnect(true);
        return;
      }

      // Put socket into a room named with the user id
      socket.join(userId);
      socket.data.userId = userId;
      this.logger.log(`Socket connected (${socket.id}) -> user ${userId}`);
    } catch (err) {
      this.logger.warn(
        `Socket auth failed (${socket.id}): ${err?.message || err}`,
      );
      socket.disconnect(true);
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(
      `Socket disconnected ${socket.id} (user ${socket.data?.userId})`,
    );
  }

  // helper: emit to specific user (room)
  emitToUser(userId: string, event: string, payload: any) {
    if (!this.server) return;
    this.server.to(userId).emit(event, payload);
  }

  // helper: emit to all (optional)
  emitToAll(event: string, payload: any) {
    if (!this.server) return;
    this.server.emit(event, payload);
  }
}
