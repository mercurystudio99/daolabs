import type { PinataPinResponse } from 'pinata_ipfs_sdk';

export interface DropEvent {
	detail: {
		acceptedFiles: FileWithPath[];
		fileRejections: FileWithErrors[];
	};
}

export interface FileWithPath extends Blob {
	lastModified: number;
	name: string;
	path?: string;
}

export interface FileWithErrors {
	file: FileWithPath;
	errors: {
		code: string;
		message: string;
	}[];
}

export interface DropzoneOutput {
	preview: string;
	pinInfo: PinataPinResponse;
}
