import Store from '$utils/Store';
import type { CollectionCategory, CollectionSortType } from '$models/collection-visibility';
import type { Collection } from '$models/minter/collection-config';
import type { NftType } from '$models/minter/nft-config';

export const selectedCollectionsTab = new Store<CollectionCategory>('all');

export const sortType = new Store<CollectionSortType>('name');
export const filterType = new Store<NftType[]>([]);
export const searchText = new Store<string>('');
export const searchResults = new Store<Collection[]>([]);
export const scrollTarget = new Store<HTMLElement | null>(null);
export const hasSearched = new Store<boolean>(false);
export const isSearching = new Store<boolean>(false);
