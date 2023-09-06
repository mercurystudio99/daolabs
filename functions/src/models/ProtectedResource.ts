import { IncomingMessage } from 'http';
export interface ProtectedResource {
	data?: string | Buffer;
	response?: IncomingMessage;
}
