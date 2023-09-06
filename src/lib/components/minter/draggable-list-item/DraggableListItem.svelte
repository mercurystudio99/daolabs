<script lang="ts">
	export let index: number;
	export let list: any[];
	export let updateOrder: (list: any[]) => void;
	export let hovering = null;
	export let readonly: boolean = false;

	const dragstart = (event: DragEvent, target: number) => {
		event.dataTransfer.effectAllowed = 'move';
		event.dataTransfer.dropEffect = 'move';
		event.dataTransfer.setData('text/plain', `${target}`);
	};
	const drop = (event: DragEvent, target: number) => {
		event.dataTransfer.dropEffect = 'move';
		const start = parseInt(event.dataTransfer.getData('text/plain'));
		const newTracklist = list;
		if (start < target) {
			newTracklist.splice(target + 1, 0, newTracklist[start]);
			newTracklist.splice(start, 1);
		} else {
			newTracklist.splice(target, 0, newTracklist[start]);
			newTracklist.splice(start + 1, 1);
		}
		list = newTracklist;
		updateOrder(newTracklist);
		hovering = null;
	};
</script>

<div
	draggable={!readonly}
	on:dragstart={(event) => dragstart(event, index)}
	on:drop|preventDefault={(event) => drop(event, index)}
	on:dragover={(ev) => {
		ev.preventDefault();
	}}
	on:dragenter={() => (hovering = index)}
>
	<slot />
</div>
