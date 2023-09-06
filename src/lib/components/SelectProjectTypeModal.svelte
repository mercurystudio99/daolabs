<script lang="ts">
	export let handleSelect = () => {};
	export let close = () => {};

	function truncate(node: HTMLElement) {
		function truckateIText() {
			const text = node.innerText;
			const LENGTH = 100;
			node.innerHTML = text.length > LENGTH ? `${text.slice(0, LENGTH - 3)}...` : text;
		}
		truckateIText();
		return {
			update: truckateIText,
		};
	}

	const projectTypes: {
		type: ProjectType;
		title: string;
		description: string;
		disabled?: boolean;
	}[] = [
		{
			type: 'default',
			title: 'Standard Project',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi dolor officiis similique!',
		},
		{
			type: 'membership',
			title: 'Membership Project',
			description:
				'Lorem ipsum dolor sit amet consectetur adipisicing elit. Nisi dolor officiis similique!',
			disabled: true,
		},
	];
</script>

<div class="modal-body">
	<h2>Select project type</h2>
	<div class="scrollable">
		<div class="items">
			{#each projectTypes as projectType}
				<div
					class="item"
					class:disabled={projectType.disabled}
					on:click={() => {
						if (projectType.disabled) return;
						handleSelect(projectType.type);
						close();
					}}
					on:keydown
				>
					<h3 class="item-title">{projectType.title}</h3>
					<p class="truncate" use:truncate>
						{projectType.description}
					</p>
				</div>
			{/each}
		</div>
	</div>
</div>

<style lang="scss">
	.modal-body {
		width: 100vw;
		max-width: 420px;
	}
	h2 {
		color: var(--text-header);
		font-size: 1.5rem;
		margin: 0 0 1rem 0;
	}
	p {
		margin: 0;
		color: var(--text-secondary);
	}
	.scrollable {
		overflow-y: auto;
		max-height: 550px;
	}
	.items {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.item {
		border: 2px solid #32c8dbaa;
		padding: 0.3rem 0.5rem;
		cursor: pointer;
		transition: border 200ms;
		&:hover {
			border: 2px solid #32c8dbff;
		}
		&.disabled {
			cursor: not-allowed;
			border-color: var(--background-disabled);
			background: var(--background-disabled);
		}
		h3 {
			margin-bottom: 0rem;
			font-size: 1.1rem;
		}
		p {
			text-transform: capitalize;
		}
	}
</style>
