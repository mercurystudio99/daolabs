/* eslint-disable no-shadow */
export enum EnumSocialMediaPlatforms {
	'twitter' = 'twitter',
	'instagram' = 'instagram',
	'facebook' = 'facebook',
	'linkedin' = 'linkedin',
	'reddit' = 'reddit',
	'youtube' = 'youtube',
}

export type SocialMediaPost = {
	mediaUrls: string[];
	message: string;
	platforms: EnumSocialMediaPlatforms[];
};
