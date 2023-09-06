export const collectionCategory = ['trending', 'all'] as const;
export type CollectionCategory = (typeof collectionCategory)[number];

export const collectionSortType = ['name', 'volume'] as const;
export type CollectionSortType = (typeof collectionSortType)[number];
