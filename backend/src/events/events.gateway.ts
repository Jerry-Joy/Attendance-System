import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:5173',
      'http://localhost:8082',
      /\.ngrok-free\.app$/,
    ],
    credentials: true,
  },
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private jwt: JwtService,
    private config: ConfigService,
  ) { }

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }
      const payload = this.jwt.verify(token, {
        secret: this.config.get<string>('JWT_SECRET'),
      });
      client.data.userId = payload.sub;
      client.data.role = payload.role;
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(_client: Socket) {
    // cleanup if needed
  }

  @SubscribeMessage('session:join')
  handleJoinSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.join(`session:${data.sessionId}`);
    return { event: 'session:joined', data: { sessionId: data.sessionId } };
  }

  @SubscribeMessage('session:leave')
  handleLeaveSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { sessionId: string },
  ) {
    client.leave(`session:${data.sessionId}`);
  }

  /** Called by AttendanceService after a student marks attendance */
  emitNewAttendance(sessionId: string, attendance: any) {
    this.server.to(`session:${sessionId}`).emit('attendance:new', attendance);
  }

  /** Called by SessionsService when a session ends */
  emitSessionEnded(sessionId: string) {
    this.server.to(`session:${sessionId}`).emit('session:ended', { sessionId });
  }

  /** Called by SessionsService when QR is refreshed */
  emitQrRefreshed(sessionId: string, newToken: string) {
    this.server
      .to(`session:${sessionId}`)
      .emit('session:qr-refreshed', { sessionId, token: newToken });
  }
}
