<script>
	import Button from '$lib/components/Button.svelte';
	import Icon from '$lib/components/Icon';
</script>

<main>
	<h1>Treasuries on Movement</h1>
	<a href="create">
		<Button>Create treasury</Button>
	</a>
</main>

<p>
	<span>
		<Icon name="infoCircle" />
	</span>
	Learn more about Movement and its Treasury <a href="/about">here</a>. While Treasury
	configurations are transparent, configurations will vary wildly and therefore there are risks
	associated with contributing funds to any Treasury. Treasuries and Collections on Movement are not
	endorsed or approved by anyone, hence our
	<a href="/terms-of-service" target="_blank" rel="noreferrer">Terms of Service</a>. Please do your
	own research.
</p>

<style>
	h1 {
		color: var(--text-header);
	}

	p {
		max-width: 800px;
		margin-bottom: 20px;
		font-size: 14px;
		font-weight: 300;
		line-height: 1.4;
	}

	main {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}
</style>
