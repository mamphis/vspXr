import { createSocket, RemoteInfo } from 'dgram';
import { networkInterfaces } from 'os';

export class BroadcastClient {
    constructor(private bindingPort: number) {
    }

    getHostName(): Promise<string> {
        const socket = createSocket('udp4');
        socket.bind(() => {
            socket.setBroadcast(true);
        });

        return new Promise<string>((res, rej) => {
            setTimeout(() => {
                socket.removeAllListeners();
                socket.close();
                rej();
            }, 5000);

            socket.once('message', (message: Buffer, rinfo: RemoteInfo) => {
                res(message.toString());
            });
            const interfaces = networkInterfaces();
            for (const intf in interfaces) {
                const addrInfos = interfaces[intf];
                if (addrInfos) {
                    for (const addr of addrInfos) {
                        if (addr.family === 'IPv4') {
                            const ipParts = Buffer.from(addr.address.split('.').map(p => parseInt(p)));
                            const subnetParts = Buffer.from(addr.netmask.split('.').map(p => parseInt(p)));
                            const broadcastParts = Buffer.from([0, 0, 0, 0]);
                            broadcastParts.writeInt32BE(~subnetParts.readInt32BE() | ipParts.readInt32BE(), 0);

                            const broadcastAddr = broadcastParts.join('.');

                            console.log(intf, broadcastAddr);
                            socket.send('vspxr', this.bindingPort, broadcastAddr);
                        }
                    }
                }
            }
        });
    }
}