<div class="tab-list">
	<slot />
	<div class="line" />
</div>

<style>
	.line {
		width: 100%;
		height: 2px;
		border-bottom: 2px solid var(--stroke-tertiary);
		position: absolute;
		left: 0;
		bottom: 0;
	}

	.tab-list {
		display: flex;
		max-width: 100vw;
		gap: 1rem;
		overflow-x: auto;
		position: relative;
		overflow-y: hidden;
	}
	.tab-list > :global(*) {
		flex-grow: 0;
		flex-shrink: 0;
	}
	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 650px) {
		.tab-list {
			flex-direction: column;
			gap: 0rem;
		}
	}
</style>
