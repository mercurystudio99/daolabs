import { Request } from 'express';
export interface TypedRequest<T, F = any> extends Request {
	body: T;
	files?: F;
}
