import { createSocket, RemoteInfo, Socket } from 'dgram';
import { hostname } from 'os';
import { Logger, LogManager } from '../../lib/logger';

export class BroadcastServer {
    server: Socket;
    logger: Logger;

    constructor(private bindingPort: number, private serverListeningPort: number) {
        this.server = createSocket('udp4');
        this.logger = LogManager.getLogger('BroadcastServer');
        this.server.bind(this.bindingPort);

        this.server.on('message', this.onMessage.bind(this));
        this.server.on('listening', () => {
            const address = this.server.address();
            this.logger.info(`Listening for broadcast messages on ${address.address}:${address.port}`);
        });
    }

    onMessage(message: Buffer, rinfo: RemoteInfo) {
        if (message.toString().startsWith('vspxr')) {
            const localAddress = `http://${hostname()}:${this.serverListeningPort}`;
            this.logger.info(`Sending address ${localAddress} to ${rinfo.address}:${rinfo.port}`);
            this.server.send(localAddress, rinfo.port, rinfo.address);
        }
    }
}