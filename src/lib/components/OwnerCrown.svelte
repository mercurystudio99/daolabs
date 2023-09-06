<script>
	import Icon from '$lib/components/Icon';
	import Popover from './Popover.svelte';

	export let title = 'Project owner';
</script>

<Popover message={title} placement="right">
	<Icon name="crown" />
</Popover>
