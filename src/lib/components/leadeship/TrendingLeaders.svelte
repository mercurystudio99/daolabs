<script>
	import ProjectCard from '$lib/components/leadeship/ProjectCard.svelte';

	const projectCards = [
		{
			projectTag: '@arbordao',
			projectAddres: '0xA848...588664',
			projectName: 'Arbor DAO',
			hashTags: ['#tree #arbordao #dao'],
		},
		{
			projectTag: '@spicedao',
			projectAddres: 'dunedao.eth',
			projectName: 'Spice Dao',
			hashTags: ['#spice #spicedao #dao'],
		},
		{
			projectTag: '@moondao',
			projectAddres: '0xce4a...cab2c9',
			projectName: 'MoonDAO',
			hashTags: ['#moon #moondao #dao'],
		},
		{
			projectTag: '@heritagedao',
			projectAddres: '0x76A7...c65B45',
			projectName: 'HeritageDAO',
			hashTags: ['#heritage #heritagedao #$hdao'],
		},
		{
			projectTag: '@lunchdao',
			projectAddres: '0x141b...6fF488',
			projectName: 'Lunch DAO',
			hashTags: ['#lunch #lunchdao #warrenbuffett'],
		},
		{
			projectTag: '@mergedao',
			projectAddres: '0xE3F4...564b46',
			projectName: 'Merge Dao',
			hashTags: ['#merge #mergedao #pak'],
		},
		{
			projectTag: '@rebelsdao',
			projectAddres: '0x2EC7...8da1C7',
			projectName: 'RebelsDAO',
			hashTags: ['#rebels #relelsdao #Web3&M...'],
		},
		{
			projectTag: '@tiles',
			projectAddres: '0x76A7...c65B45',
			projectName: 'TileDAO',
			hashTags: ['#tiles #tiledao #art'],
		},
	];
</script>

<div class="TrendingLeaders__container">
	<h3>Trending Leaders</h3>

	<div class="AccountsGrid">
		{#each projectCards as projectCard}
			<ProjectCard {...projectCard} />
		{/each}
	</div>
</div>

<style lang="scss">
	.TrendingLeaders__container {
		padding-top: 19px;
		background: rgba(217, 217, 217, 0.3);
		padding-bottom: 44px;
		h3 {
			font-weight: 500;
			font-size: 21px;
			line-height: 33px;
			/* identical to box height, or 157% */

			text-align: center;
			letter-spacing: -0.0043em;

			color: #e9a63d;

			mix-blend-mode: normal;
		}

		.AccountsGrid {
			display: flex;
			flex-wrap: wrap;
			gap: 23px;

			margin-left: 9.44%;
			margin-right: 7.8%;
		}
	}
</style>
