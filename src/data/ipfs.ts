import type { IpfsCacheName } from '$models/ipfs-cache/cache-name';
import type { IpfsCacheData, IpfsCacheJsonData } from '$models/ipfs-cache/cache-data';

export type IpfsCacheOpts<T extends IpfsCacheName> = {
	ttl: number;
	deserialize?: (x: IpfsCacheJsonData[T]) => IpfsCacheData[T];
};
