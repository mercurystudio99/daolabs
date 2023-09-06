<script lang="ts">
	/** Thanks to https://codepen.io/thebabydino/pen/kNqgKO for the vinyl */
	export let innerColor = '#da5b33';
	export let circle = '#b5ac9a';

	const cssVarStyles = `
        --inner-color: ${innerColor};
        --circle-color: ${circle};
    `;
</script>

<div class="record-container" style={cssVarStyles}>
	<div class="record" />
</div>

<style>
	.record-container {
		--inner-color: #da5b33;
		--circle: #b5ac9a;
		--innerSize: 68px;

		text-align: center;
		display: inline-block;
		overflow: hidden;
	}
	.record {
		position: relative;
		margin: 19px auto;
		width: 262px;
		height: 262px;
		border-radius: 50%;
		background: linear-gradient(30deg, transparent 40%, rgba(42, 41, 40, 0.85) 40%) no-repeat 100% 0,
			linear-gradient(60deg, rgba(42, 41, 40, 0.85) 60%, transparent 60%) no-repeat 0 100%,
			repeating-radial-gradient(#2a2928, #2a2928 4px, #ada9a0 5px, #2a2928 6px);
		background-size: 50% 100%, 100% 50%, 100% 100%;
	}
	.record:after {
		position: absolute;
		top: 50%;
		left: 50%;
		margin: calc((var(--innerSize) + 2px) / -2);
		border: solid 1px #d9a388;
		width: var(--innerSize);
		height: var(--innerSize);
		border-radius: 50%;
		box-shadow: 0 0 0 4px var(--inner-color), inset 0 0 0 27px var(--inner-color);
		background: var(--circle);
		content: '';
	}
</style>
