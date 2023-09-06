import { IpfsCacheName } from './cache-name';
import type { TrendingProject, TrendingProjectJson } from '$models/subgraph-entities/vX/project';

export type IpfsCacheJsonData = {
	[IpfsCacheName.trendingV2]: TrendingProjectJson[];
};

export type IpfsCacheData = {
	[IpfsCacheName.trendingV2]: TrendingProject[];
};
