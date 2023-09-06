<script lang="ts">
	import { getContext } from 'svelte';
	import Pay from '$lib/components/Pay.svelte';
	import { weightedAmount } from '$utils/v2/math';
	import type Store from '$utils/Store';
	import type { V2ProjectContextType } from '$models/project-type';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');

	$: payButton = $project?.projectMetadata?.payButton || 'Pay';
</script>

<Pay
	{payButton}
	disabled
	onClick={() => console.info('🛠 TODO pay in create preview')}
	reservedRate={$project.fundingCycleMetadata.reservedRate.toNumber()}
	weight={$project.fundingCycle.weight}
	weightingFn={weightedAmount}
/>
