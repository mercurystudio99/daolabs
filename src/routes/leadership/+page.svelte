<script lang="ts">
	import Intro from '$lib/components/leadeship/intro.svelte';
</script>

<div class="leadirhip__container">
	<Intro />
	<!--
	<TrendingLeaders />
	<TreasuryTweets />
	<AboutLeaders />
	-->
	<div class="footer" />
</div>

<style lang="scss">
	.leadirhip__container {
		display: flex;
		flex-direction: column;
		background: #fbf9f6;

		.footer {
			height: 323px;
		}
	}
</style>
