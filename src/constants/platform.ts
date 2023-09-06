export const JuiceboxPlatform = 'juicebox';
export const DaolabsPlatform = 'daolabs';

const PV2 = '2';
const PV3 = '3';

type JuiceboxVersion = typeof PV2 | typeof PV3;

export type ProjectPlatform = typeof JuiceboxPlatform | typeof DaolabsPlatform;
export type ContractPlatform =
	| `${typeof JuiceboxPlatform}${JuiceboxVersion}`
	| typeof DaolabsPlatform;

export function projectPlatformWithVersion(
	platform: ProjectPlatform,
	pv: '2' | '3',
): ContractPlatform {
	if (platform === 'juicebox') {
		return `${platform}${pv}`;
	}
	return platform;
}
