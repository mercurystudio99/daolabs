<script lang="ts">
	import { marked } from 'marked';

	const markdown = `
_Effective Date: August 20, 2022_, _Last updated: January 23, 2022_,	

_Some terms used in this document have specific meanings, and are defined in the [Definitions](https://move.xyz/daolabs/daos/move/legal/definitions.md)._

## About.

MOVEMENT DAO/DAOLABS and its community are building a platform for creating blockchain-based treasuries and communities which can operate at any scale. By providing tooling and a potential seeded endowment, the MOVEMENT Dapp utilizes the Ethereum blockchain to allow communities to institute collective problem-solving, align economic incentives, and create programmable and community-funded treasuries.[^1] The community plays a vital role in maintaining decentralization and trust.[^2] With that said, the MOVEMENT DAO holds veto powers on any movements or initiatives to ensure that the community is aligned with the DAO's guidelines.[^3]

If you are building (or would like to build) a sustainable, high-impact project with a focus on social good, reach out on [Discord](https://discord.gg/daolabs).

## Purpose.

The primary purpose of the Dapp is to enable Ethereum treasuries that are transparent, turnkey, extensible, scalable, community-focused, compatible with existing banking infrastructure, and legally compliant.[^4]

MOVEMENT DAO is building:

- diverse NFT tooling for creators and communities;
- tools for treasury diversification and token management;
- on-chain and off-chain governance tools; and,
- reputation scoring and ranking for treasuries, communities, and individuals.
- legal frameworks which enable associations and entities to utilize cryptocurrencies;
- legal structure/governance document generators;

While also:

- supporting other DAO-centric tooling and communities;
- developing sustainable public/private good community models; and,
- developing a sustainable endowment fund for Member projects and Core Contributors.

MOVEMENT DAO seeks to foster trust through both a 6 year lock-up of the founder's tokens to prioritize long-term sustainability and advanced mechanism design concepts for the Dapp that MOVEMENT is building.[^5]

The Dapp enables treasury creators to create and deploy integrated Crypto-native products for thriving and scaling treasuries. The DAO manages and governs its Endowment, funding applications, and ecosystem grants proposed by contributors.[^6] The Dapp has and will continue to go through rigorous design, analysis, and audits, which are essential before deploying on Ethereum Mainnet.[^7]

## Repositories.

The MOVEMENT DAO's applications are coordinated through Gnosis Safes and smart contracts.[^8] Currently the front-end of the Dapp is not open source, and is private, mainly because the development team still has more work to do on the current Dapp UI, so for security purposes the code will not be made public yet. With that said, the development team has made the Svelte UI and smart contracts public, and intends on making the front-end code public once it is safe to do so.

## Juicebox Fork.

MOVEMENT DAO greatly appreciates all the work that the Juicebox protocol has done for DAO-creation applications and tooling, and thanks Juicebox for making it's smart contracts open source. The way in which the Juicebox protocol allows users to deploy a treasury which automatically mints tokens to contributors is both elegant and efficient.

Out of respect and consideration, the development team wants to be completely transparent about the fact that they have forked the Juicebox protocol code. The reason for this is that they wanted to build in more trust and security to the protocol while keeping it decentralized and allowing for users to maintain their anonymity.  However, MOVEMENT does enforce a number of regulatory aspects of the Treasury tooling, details will be forthcoming.

## General.

The DAO is a [Delaware Unincorporated Nonprofit Association](https://docs.move.xyz/daolabs/daos/move/legal/guiding-principles.md), operating with contributions to its [Gnosis Safe](https://etherscan.io/address/0x143cC0A996De329C1C5723Ee4F15D2a40c1203c6), which amount to [$11,511,585.41 as of June 5, 2023](https://app.safe.global/home?safe=eth:0x143cC0A996De329C1C5723Ee4F15D2a40c1203c6). The signers of the DAO's Gnosis Safe can be found at [Gnosis Settings](https://app.safe.global/settings/setup?safe=eth:0x143cC0A996De329C1C5723Ee4F15D2a40c1203c6). DAOLABS, LLC. provides all the intellectual property the DAO will use via a perpetual, non-exclusive, royalty-free license and right, and all ancillary and subsidiary rights therein within the field of use of the DAO's non-profit charter. DAOLABS, Inc. operates with an exclusive license from DAOLABS, with the exception that the field of use for the DAO tooling is targeted towards vertical and consumer for-profit applications. Ownership in the DAOLABS entities is further detailed in the DAO governance.

## Disclaimers.

Note that DAOLABS reserves the right to modify its Purpose, or associated Terms at any time in our sole discretion[^9]. Any changes will be posted on our website at [https://move.xyz](https://move.xyz) and will become effective immediately upon posting. It is your responsibility to check for updates periodically.

[^1]: [GitBook](https://move.xyz/daolabs/policies/gitbook/README.md), Mission
[^2]: [GitBook](https://move.xyz/daolabs/policies/gitbook/README.md), Community Pledge
[^3]: [GitBook](https://move.xyz/daolabs/policies/gitbook/README.md), Membership
[^4]: Including compliance for traditional entities: unincorporated, incorporated, for-profit, non-profit, associations, etc.
[^5]: [GitBook](https://move.xyz/daolabs/policies/gitbook/README.md), Why should I trust this platform?
[^6]: DAO's endowment subject to the final approved legal structure and relationships between the unincorporated non-profit or the DAO, DAOLABS, LLC, and DAOLABS, Inc.
[^7]: [GitBook](https://move.xyz/daolabs/policies/gitbook/README.md), Scope
[^8]: Including [Juicebox v2](https://info.juicebox.money/dev/resources/addresses), [Gnosis Safe](https://github.com/safe-global/safe-contracts), and others.
[^9]: Notwithstanding any right to modify any documents, the Guiding Principals and other DAO Charters require a community Snapshot vote prior to any changes.

`;
</script>

<section>
	<div class="only-mobile">
		<br />
	</div>

	{@html marked(markdown)}

	<br />
	<br />
</section>

<style>
	section {
		max-width: 900px;
		margin: 0 auto;
		text-align: justify;
		padding: 1rem;
	}
</style>
