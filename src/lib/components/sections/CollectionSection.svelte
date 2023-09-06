<script lang="ts">
	import PopInfo from '../PopInfo.svelte';

	export let title: string;
	export let info: string = '';
	export let required: boolean = false;
</script>

<div class="section">
	<h3 class="sub-section-title" id="sub-section-title">
		<label for="sub-section-title">
			{title}<small>{required ? '*' : ''}</small>
			{#if info}
				<PopInfo message={info} placement="bottom" />
			{/if}
		</label>
	</h3>
	<slot />
</div>

<style lang="scss">
	.section {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding-bottom: 16px;
		margin-bottom: 16px;
		border-bottom: 1px solid var(--stroke-tertiary);
	}

	.sub-section-title {
		color: var(--text-header);
		margin-bottom: 0px;

		label {
			display: flex;

			small {
				align-self: flex-start;
			}
		}
	}
</style>
