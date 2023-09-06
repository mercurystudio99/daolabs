<script lang="ts">
	import { onMount } from 'svelte';

	export let graphSize = 300;
	export let graphPad = 50;
	export let yLable = '% tokens redeemed';
	export let xLable = 'Token redeem value';
	export let rate = 100;
	export let equation;
	export let maxX = 10;
	export let maxY = 10;

	let calculator;

	const GRAPH_CONTAINER_ID = 'graph-container';
	const bondingCurveId = 'bonding-curve';
	const baseCurveId = 'base-curve';

	const graphCurve = (_value?: number) => {
		const primaryColor = getComputedStyle(document.documentElement).getPropertyValue(
			'--text-brand-primary',
		);
		const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue(
			'--text-brand-secondary',
		);
		if (_value === undefined || !calculator) return;

		calculator.setMathBounds({
			left: 0,
			bottom: 0,
			right: maxX,
			top: maxY,
		});
		calculator.removeExpressions([{ id: bondingCurveId }, { id: baseCurveId }]);
		calculator.setExpression({
			id: bondingCurveId,
			latex: equation ? equation(_value) : `y=${_value / 100}*(1+x/100)*x`,
			color: primaryColor,
		});
		calculator.setExpression({
			id: baseCurveId,
			latex: 'y=x',
			color: secondaryColor,
		});
	};

	onMount(async () => {
		//@ts-ignore
		const { default: Desmos } = await import('desmos');

		calculator = Desmos.GraphingCalculator(document.getElementById(GRAPH_CONTAINER_ID), {
			keypad: false,
			expressions: false,
			settingsMenu: false,
			zoomButtons: false,
			expressionsTopbar: false,
			pointsOfInterest: false,
			trace: false,
			border: false,
			lockViewport: true,
			images: false,
			folders: false,
			notes: false,
			sliders: false,
			links: false,
			distributions: false,
			pasteTableData: false,
			showGrid: false,
			showXAxis: true,
			showYAxis: true,
			xAxisNumbers: true,
			yAxisNumbers: true,
			polarNumbers: false,
		});
		graphCurve(100);
	});

	$: {
		graphCurve(rate);
	}
</script>

<div class="graph-container">
	<div class="graph" style={`height: ${graphSize}px; width: ${graphSize}px`}>
		<div
			id={GRAPH_CONTAINER_ID}
			style={`width: ${graphSize - graphPad}px; height: ${graphSize - graphPad}px`}
		/>
	</div>
	<div
		class="graph-legends"
		style={`top: ${graphPad / 2}px; left: ${graphPad / 2}px; width: ${
			graphSize - graphPad
		}px; height: ${graphSize - graphPad}px`}
	/>
	<div class="label">{yLable}</div>
	<div class="label y-label" style={`width: ${graphSize}px`}>{xLable}</div>
</div>

<style lang="scss">
	.graph {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.graph-legends {
		position: absolute;
		border-left: 2px solid var(--stroke-secondary);
		border-bottom: 2px solid var(--stroke-secondary);
	}

	.graph-container {
		position: relative;
	}
	.label {
		font-size: 0.7em;
		text-align: center;
	}
	.y-label {
		position: absolute;
		transform: rotate(-90deg);
		bottom: 0;
		left: 0;
		top: 0;
	}
</style>
