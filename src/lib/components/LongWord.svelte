<script lang="ts" context="module">
	export function truncateLongWord(word: string, maxLength: number = 10): string {
		if (word.length > maxLength) {
			return `${word.substring(0, maxLength - 3)}...`;
		}
		return word;
	}
</script>

<script lang="ts">
	export let width = 200;
	export let ellipsis = false;
</script>

<span class="longWord" class:ellipsis style="max-width: {width}px">
	<slot />
</span>

<style>
	span.longWord {
		display: inline-flex;
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}

	span.ellipsis {
		display: block;
	}
</style>
