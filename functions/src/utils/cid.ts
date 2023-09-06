import { CID } from 'multiformats/cid';

export function cidToV0(cid: string) {
	if (cid.startsWith('b')) return CID.parse(cid).toV0();
	return cid;
}
