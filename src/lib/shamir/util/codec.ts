import { Buffer } from 'buffer';
import { zeroes } from './table';

import { BYTES_PER_CHARACTER, UTF8_ENCODING, BIN_ENCODING, BIT_COUNT, BIT_SIZE } from './constants';

function pad(text: string, multiple?: number) {
	let missing = 0;
	let result = text;

	if (!multiple) {
		multiple = BIT_COUNT;
	}

	if (text) {
		missing = text.length % multiple;
	}

	if (missing) {
		const offset = -(multiple - missing + text.length);
		result = (zeroes + text).slice(offset);
	}

	return result;
}

function hex(buffer: any, encoding?: string) {
	const padding = 2 * BYTES_PER_CHARACTER;

	if (!encoding) {
		encoding = UTF8_ENCODING;
	}

	if (typeof buffer === 'string') {
		return fromString();
	}

	if (Buffer.isBuffer(buffer)) {
		return fromBuffer();
	}

	throw new TypeError('Expecting a string or buffer as input.');

	function fromString() {
		const chunks = [];

		if (UTF8_ENCODING === encoding) {
			for (let i = 0; i < buffer.length; ++i) {
				const chunk = Number(String.fromCharCode(buffer[i])).toString(16);
				chunks.unshift(pad(chunk, padding));
			}
		}

		if (BIN_ENCODING === encoding) {
			buffer = pad(buffer, 4);

			for (let i = buffer.length; i >= 4; i -= 4) {
				const bits = buffer.slice(i - 4, i);
				const chunk = parseInt(bits, 2).toString(16);
				chunks.unshift(chunk);
			}
		}

		return chunks.join('');
	}

	function fromBuffer() {
		const chunks = [];

		for (let i = 0; i < buffer.length; ++i) {
			const chunk = buffer[i].toString(16);
			chunks.unshift(pad(chunk, padding));
		}

		return chunks.join('');
	}
}

function bin(buffer: any, radix?: number) {
	const chunks = [];

	if (!radix) {
		radix = 16;
	}

	for (let i = buffer.length - 1; i >= 0; --i) {
		let chunk = null;

		if (Buffer.isBuffer(buffer)) {
			chunk = buffer[i];
		}

		if (typeof buffer === 'string') {
			chunk = parseInt(buffer[i], radix);
		}

		if (Array.isArray(buffer)) {
			chunk = buffer[i];

			if (typeof chunk === 'string') {
				chunk = parseInt(chunk, radix);
			}
		}

		if (chunk === null) {
			throw new TypeError('Unsupported type for chunk in buffer array.');
		}

		chunks.unshift(pad(chunk.toString(2), 4));
	}

	return chunks.join('');
}

function encode(id: any, data: any) {
	id = parseInt(id, 16);

	const padding = (BIT_SIZE - 1).toString(16).length;
	const header = Buffer.concat([
		Buffer.from(BIT_COUNT.toString(36).toUpperCase()), // 8
		Buffer.from(pad(id.toString(16), padding)),
	]);

	if (Buffer.isBuffer(data) === false) {
		data = Buffer.from(data);
	}

	return Buffer.concat([header, data]);
}

function decode(buffer: any, encoding?: string) {
	const padding = 2 * BYTES_PER_CHARACTER;
	const offset = padding;
	const chunks = [];

	if (Buffer.isBuffer(buffer)) {
		buffer = buffer.toString(encoding);
	}

	buffer = pad(buffer, padding);

	for (let i = 0; i < buffer.length; i += offset) {
		const bits = buffer.slice(i, i + offset);
		const chunk = parseInt(bits, 16);
		chunks.unshift(chunk);
	}

	return Buffer.from(chunks);
}

function split(string: any, padding?: number, radix?: number) {
	const chunks = [];
	let i = 0;

	if (Buffer.isBuffer(string)) {
		string = string.toString();
	}

	if (padding) {
		string = pad(string, padding);
	}

	for (i = string.length; i > BIT_COUNT; i -= BIT_COUNT) {
		const bits = string.slice(i - BIT_COUNT, i);
		const chunk = parseInt(bits, radix);
		chunks.push(chunk);
	}

	chunks.push(parseInt(string.slice(0, i), radix));

	return chunks;
}

export { encode, decode, split, bin, hex, pad };
