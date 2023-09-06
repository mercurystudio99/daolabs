<script lang="ts">
	import { marked } from 'marked';
	type Data = {
		userLegal: string;
	};

	export let data: Data;
</script>

<section>
	{@html marked(data.userLegal || '')}
	<br />
	<br />
</section>

<style lang="scss">
	section {
		max-width: 900px;
		margin: 0 auto;
		text-align: justify;
		padding: 1rem;
	}
</style>
