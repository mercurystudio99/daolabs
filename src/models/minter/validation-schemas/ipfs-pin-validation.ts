import * as yup from 'yup';
import type { PinataPinResponse } from 'pinata_ipfs_sdk';

export const ipfsPinValidation: yup.SchemaOf<PinataPinResponse> = yup.object({
	IpfsHash: yup.string(),
	PinSize: yup.number(),
	Timestamp: yup.string(),
});
export const ipfsPinValidationRequired: yup.SchemaOf<PinataPinResponse> = yup.object({
	IpfsHash: yup.string().required('Required'),
	PinSize: yup.number(),
	Timestamp: yup.string(),
});
