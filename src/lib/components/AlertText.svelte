<script>
	import Icon from '$lib/components/Icon';
</script>

<p>
	<Icon name="questionCircle" />
	<slot />
</p>

<style>
	p {
		font-weight: 300;
		color: var(--text-warn);
	}
</style>
