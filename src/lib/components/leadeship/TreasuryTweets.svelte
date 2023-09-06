<script>
	import TreasuryTweetsProjectCard from './TreasuryTweets__ProjectCard.svelte';

	const projectCards = [
		{
			projectName: 'Moonbirds',
			projectPrice: 'Ξ53.07',
			percentageChange: '+38.45%',
			priceChange: 'Ξ100,443',
		},
		{
			projectName: 'BannyVerse',
			projectPrice: 'Ξ69.420',
			percentageChange: '+273.88%',
			priceChange: 'Ξ291,119.75',
		},
		{
			projectName: 'Bored Ape Yacht Club',
			projectPrice: 'Ξ10',
			percentageChange: '-57.60%',
			priceChange: 'Ξ11,006.55',
		},
		{
			projectName: 'MeowsDAO Genesis Collecti...',
			projectPrice: 'Ξ4.20',
			percentageChange: '+29.12%',
			priceChange: 'Ξ5,095.55',
		},
		{
			projectName: 'Infinite Tiles v2',
			projectPrice: 'Ξ42.55',
			percentageChange: '+29.12%',
			priceChange: 'Ξ51,095.55',
		},
	];
</script>

<div class="TreasuryTweets__container">
	<img src="" alt="" />

	<div class="Tweets__container">
		<h3>Treasury Tweets</h3>

		{#each projectCards as projectCard}
			<TreasuryTweetsProjectCard {...projectCard} />
		{/each}
	</div>
</div>

<style lang="scss">
	.TreasuryTweets__container {
		display: flex;
		gap: 87px;
		padding-left: 7.2%;
		padding-top: 63px;
		padding-right: 8.2%;
		padding-bottom: 72px;
		align-items: center;
		flex-wrap: wrap;
		justify-content: space-between;

		img {
			width: 567px;
			height: 462px;
		}

		.Tweets__container {
			display: flex;
			flex-direction: column;
			gap: 8px;
			h3 {
				font-size: 21px;
				line-height: 33px;
				/* identical to box height, or 157% */

				letter-spacing: -0.0043em;

				color: #e9a63d;
			}
		}
	}
</style>
