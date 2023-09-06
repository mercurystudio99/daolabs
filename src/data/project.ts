import { BigNumber } from 'ethers';
import axios from 'axios';
import { SECONDS_IN_DAY } from '$constants/numbers';
import { consolidateMetadata, type AnyProjectMetadata } from '$models/project-metadata';
import {
	querySubgraph,
	querySubgraphExhaustive,
	type EntityKeys,
	type GraphQueryOpts,
	type InfiniteGraphQueryOpts,
	type WhereConfig,
} from '$utils/graph';
import { ipfsCidToWorkerUrl } from '$utils/ipfs';
import { DaolabsPlatform, JuiceboxPlatform } from '$constants/platform';
import type { ProjectState } from '$models/project-visibility';
import type { Project, ProjectV2, TrendingProject } from '$models/subgraph-entities/vX/project';
import type { PayEvent } from '$models/subgraph-entities/vX/pay-event';

type ProjectStat = Record<
	string,
	{
		trendingVolume: BigNumber;
		paymentsCount: number;
	}
>;

export interface ProjectsOptions {
	pageNumber?: number;
	projectId?: BigNumber;
	platform?: string;
	projectIds?: number[];
	metadataUri?: string;
	orderBy?: 'createdAt' | 'currentBalance' | 'totalPaid';
	orderDirection?: 'asc' | 'desc';
	pageSize?: number;
	state?: ProjectState;
	keys?: (keyof Project)[];
}

// TODO: Fix the cv and pv thing for goerli
const projectKeys: (keyof Project)[] = [
	'id',
	'platform',
	'projectId',
	'handle',
	'owner',
	'createdAt',
	'metadataUri',
	'currentBalance',
	'totalPaid',
	'totalRedeemed',
	'pv',
];

const queryOpts = (
	opts: ProjectsOptions,
): Partial<
	| GraphQueryOpts<'project', EntityKeys<'project'>>
	| InfiniteGraphQueryOpts<'project', EntityKeys<'project'>>
> => {
	const where: WhereConfig<'project'>[] = [
		{
			key: 'pv',
			value: '2',
		},
	];

	if (opts.projectIds) {
		where.push({
			key: 'projectId',
			operator: 'in',
			value: opts.projectIds || [],
		});
	}

	if (opts.projectId) {
		where.push(
			opts.platform
				? {
						key: 'id' as const,
						value: `${opts.platform}-2-${+opts.projectId}`,
				  }
				: {
						key: 'id' as const,
						value: [
							`${JuiceboxPlatform}-2-${+opts.projectId}`,
							`${DaolabsPlatform}-2-${+opts.projectId}`,
						],
						operator: 'in',
				  },
		);
	}

	if (opts.platform) {
		where.push({
			key: 'platform',
			value: opts.platform,
		});
	}

	return {
		entity: 'project',
		keys: opts.keys ?? projectKeys,
		orderDirection: opts.orderDirection ?? 'desc',
		orderBy: opts.orderBy ?? 'totalPaid',
		pageSize: opts.pageSize,
		where,
	};
};

export async function getProjects(opts: ProjectsOptions) {
	return querySubgraph({
		...(queryOpts(opts) as GraphQueryOpts<'project', EntityKeys<'project'>>),
		first: opts.pageSize,
		skip: opts.pageNumber && opts.pageSize ? opts.pageNumber * opts.pageSize : undefined,
	});
}

export async function getProjectMetadata(metadataUri: string | undefined) {
	if (!metadataUri) {
		console.error('No metadataUri provided');
		return;
	}
	const url = ipfsCidToWorkerUrl(metadataUri);
	const response = await axios.get(url, {
		headers: {
			apikey: import.meta.env.VITE_API_KEY as string,
		},
	});
	return consolidateMetadata(<AnyProjectMetadata>response.data);
}

export function getProjectStatsFromPayments(payments: PayEvent[] = []) {
	return payments.reduce((acc, curr) => {
		const projectId = curr.project.id?.toString();
		return projectId
			? {
					...acc,
					[projectId]: {
						trendingVolume: BigNumber.from(acc[projectId]?.trendingVolume ?? 0).add(curr.amount),
						paymentsCount: (acc[projectId]?.paymentsCount ?? 0) + 1,
					},
			  }
			: acc;
	}, {} as ProjectStat);
}

export function getTrendingProjectsFromProjectsAndStats(
	projects: ProjectV2[] = [],
	projectStats: ProjectStat = {},
) {
	return projects
		?.map((p) => {
			const stats = p.id && projectStats ? projectStats[p.id.toString()] : undefined;

			// Algorithm to rank trending projects:
			// trendingScore = volume * (number of payments)^2
			const trendingScore = stats?.trendingVolume.mul(BigNumber.from(stats.paymentsCount).pow(2));

			return {
				...p,
				trendingScore,
				trendingVolume: stats?.trendingVolume,
				trendingPaymentsCount: stats?.paymentsCount,
			} as TrendingProject;
		})
		.sort((a: TrendingProject, b: TrendingProject) =>
			a.trendingScore?.gt(b.trendingScore ?? 0) ? -1 : 1,
		);
}

export async function getLatestPayments(platform: string, days = 7) {
	const daySeconds = days * SECONDS_IN_DAY;
	const now = new Date().setUTCHours(0, 0, 0, 0); // get start of day, for determinism
	const nowSeconds = now.valueOf() / 1000;

	const where: WhereConfig<'payEvent'>[] = [
		{
			key: 'timestamp',
			value: nowSeconds - daySeconds,
			operator: 'gte',
		},
	];

	if (platform) {
		where.push({
			key: 'project',
			operator: '',
			value: `{ platform: "${platform}" }`,
		});
	}

	return querySubgraphExhaustive({
		entity: 'payEvent',
		keys: [
			'amount',
			{
				entity: 'project',
				keys: ['id'],
			},
		],
		where: where,
	});
}

export async function getProjectsFromIds(ids: string[]) {
	return querySubgraph({
		entity: 'project',
		keys: projectKeys,
		where: [
			{
				key: 'id',
				value: ids,
				operator: 'in',
			},
			{
				key: 'pv',
				value: '2',
				operator: 'contains',
			},
		],
	});
}

const defaultKeys = projectKeys;
export async function useProjectsSearch<K extends EntityKeys<'projectSearch'>>({
	searchText,
	keys = defaultKeys as K[],
}: {
	searchText: string | undefined;
	keys?: K[];
}) {
	return (
		await querySubgraph({
			entity: 'projectSearch',
			keys,
			text: `'${searchText}'`,
		})
	).filter((project) => project.pv === '2');
}

export async function trendingProjectsQuery(
	platform: string,
	count: number,
	trendingWindowDays: number,
) {
	const payments = await getLatestPayments(platform, trendingWindowDays);
	const projectStats = getProjectStatsFromPayments(payments);
	const ids = Object.keys(projectStats);
	const projectsQuery = await getProjectsFromIds(ids);
	const trendingProjects = getTrendingProjectsFromProjectsAndStats(
		projectsQuery,
		projectStats,
	).slice(0, count);
	return trendingProjects;
}

export async function myProjectsQuery(platform: string, wallet: string | undefined) {
	const where: WhereConfig<'project'>[] = platform
		? [
				{
					key: 'platform',
					value: platform,
				},
		  ]
		: [];

	const projectsQuery = await querySubgraph(
		wallet
			? {
					entity: 'project',
					keys: projectKeys,
					where: [
						{
							key: 'owner',
							operator: 'in',
							value: [wallet],
						},
						{
							key: 'pv',
							value: '2',
						},
						...where,
					],
			  }
			: null,
	);

	return projectsQuery;
}

export async function holdingsProjectsQuery(platform: string, wallet: string | undefined) {
	const loadParticipants = async () => {
		const where: WhereConfig<'participant'>[] = platform
			? [
					{
						key: 'project',
						operator: '',
						value: `{platform: "${platform}"}`,
					},
			  ]
			: [];
		const participants = await querySubgraphExhaustive(
			wallet
				? {
						entity: 'participant',
						orderBy: 'balance',
						orderDirection: 'desc',
						keys: [
							{
								entity: 'project',
								keys: ['id'],
							},
						],
						where: [
							{
								key: 'pv',
								value: '2',
							},
							{
								key: 'wallet',
								value: wallet,
							},
							...where,
						],
				  }
				: null,
		);

		if (!participants) {
			return;
		}

		const projectIds = participants?.reduce((acc, curr) => {
			const projectId = curr?.project?.id?.toString();

			return [...acc, ...(projectId ? (acc.includes(projectId) ? [] : [projectId]) : [])];
		}, [] as string[]);

		return projectIds;
	};

	const projectIds = await loadParticipants();

	const projectsQuery = await querySubgraph(
		projectIds
			? {
					entity: 'project',
					keys: projectKeys,
					where: {
						key: 'id',
						operator: 'in',
						value: projectIds,
					},
			  }
			: null,
	);

	return projectsQuery;
}

export function infiniteProjectsQuery(opts: ProjectsOptions) {
	return querySubgraphExhaustive(
		queryOpts(opts) as InfiniteGraphQueryOpts<'project', EntityKeys<'project'>>,
	);
}

export async function getTrendingProjects(platform: string, days: number, count: number) {
	return trendingProjectsQuery(platform, count, days);
}
