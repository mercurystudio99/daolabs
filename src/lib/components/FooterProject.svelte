<script lang="ts">
	import { onMount } from 'svelte';
	import { getCommitHash, type CommitData } from '$lib/utils/getCommitHashData';

	let commitData: CommitData;

	onMount(() => {
		commitData = getCommitHash();
	});
</script>

<footer>
	<div class="links">
		<a href={null} on:click|preventDefault={() => window.scrollTo(0, 0)}>Back to top</a>
		<span class="hidden">|</span>
		<a href="/terms-of-service" target="_blank">Terms of Service</a>
	</div>
	{#if commitData}
		<div class="versions">
			<a
				href={`https://github.com/tankbottoms/juice-interface-svelte/commit/${commitData.hash}`}
				target="_blank"
				rel="noreferrer"
			>
				#{commitData.hash}-{commitData.timestamp}
			</a>
		</div>
	{/if}
</footer>

<style>
	.links,
	.versions {
		display: flex;
		justify-content: center;
	}

	footer {
		padding: 10px 20px;
		position: fixed;
		background: var(--background-l1);
		width: 100%;
		bottom: 0;
	}

	.links {
		gap: 1rem;
	}

	.versions {
		font-size: 10px;
	}

	.versions a {
		color: var(--text-tertiary);
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 500px) {
		.links a {
			font-size: 12px;
		}
		.links,
		.versions {
			flex-direction: column;
			align-items: center;
			gap: 0rem;
		}
		.hidden {
			display: none;
		}
	}
</style>
