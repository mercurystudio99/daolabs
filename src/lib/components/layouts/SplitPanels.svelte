<div class="wrapper">
	<section>
		<div class="left">
			<slot name="left" />
		</div>
		<div class="right">
			<slot name="right" />
		</div>
	</section>
</div>

<style>
	section {
		display: flex;
		max-width: 1200px;
		margin: auto;
		flex-wrap: wrap;
		justify-content: space-between;
	}

	.wrapper {
		background: var(--background-l0);
		padding: 5rem 1rem;
	}

	.left {
		flex: 0 0 45%;
		max-width: 45%;
	}

	.right {
		flex: 0 0 45%;
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 850px) {
		div.left,
		div.right {
			flex: 0 0 100%;
			max-width: 100%;
		}

		.left {
			margin-left: 0px;
			padding: 10px 20px;
		}

		.right {
			margin-left: 0;
			padding: 20px;
		}
	}
</style>
