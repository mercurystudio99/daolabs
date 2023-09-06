<script lang="ts">
	import { axisBottom, axisRight, scaleLinear, scalePoint, select, type ValueFn } from 'd3';
	import * as d3 from 'd3';
	import { format } from 'date-fns';
	import { browser } from '$app/environment';
	import { daysToMillis } from './utils';
	import type { EventRef } from './types';

	export let width = browser ? window.innerWidth : 500;
	export let data: EventRef[];
	export let duration: number;

	const TICKS = 7;

	let shownTooltip = false;
	let toolTipContent = [0, 0, '', ''];

	const dateStringForBlockTime = (timestamp: number) =>
		duration ? format(timestamp * 1000, duration > 1 ? 'M/dd' : 'h:mma') : undefined;

	export const loadDomain = (events: EventRef[]): [number, number] => {
		let max: number | undefined;
		let min: number | undefined;
		// Calculate domain for graph based on floor/ceiling balances
		events.forEach((r) => {
			if (r.value === undefined) return;
			if (min === undefined || r.value < min) min = r.value;
			if (max === undefined || r.value > max) max = r.value;
		});

		if (max === undefined || min === undefined) {
			return [0, 0.1];
		} else {
			const domainPad = (max - min) * 0.05;
			return [Math.max(min - domainPad, 0), Math.max(max + domainPad, 0.1)];
		}
	};

	function draw(nodeId: string, chartWidth: number, eventData: EventRef[], eventDuration: number) {
		const svg = select(`#${nodeId}`);
		const margin = 40;
		const height = Number(svg.attr('height')) - margin;

		const events: { timestamp: number; value?: number }[] = [];
		const now = Date.now() - 1000 * 60 * 5;
		const durationInMillis = daysToMillis(
			eventDuration === 365 ? eventDuration - 1 : eventDuration === 1 ? 0.99 : eventDuration,
		);
		const fromTime = now - durationInMillis;
		const durationInTick = Math.floor(durationInMillis / 100);
		for (let time = fromTime; time <= now; time += durationInTick) {
			const prevEvents = eventData.filter((e) => e.timestamp * 1000 <= time);
			if (prevEvents.length) {
				const lastEvent = prevEvents[prevEvents.length - 1];
				events.push({ timestamp: Math.floor(time / 1000), value: lastEvent.value });
			} else {
				events.push({ timestamp: Math.floor(time / 1000), value: 0 });
			}
		}

		const xScale = scalePoint()
			.domain(events.map((e) => dateStringForBlockTime(e.timestamp)))
			.range([0, chartWidth]);
		const xScaleTick = scalePoint()
			.domain(events.filter((e, i) => !(i % 10)).map((e) => dateStringForBlockTime(e.timestamp)))
			.range([0, chartWidth]);

		// X-AXIS TEXT + VT Lines
		const xAxis = svg
			.append('g')
			.attr('style', 'color: var(--stroke-tertiary)')
			.attr('stroke-dasharray', '4 2')
			.attr('transform', 'translate(-0,0)')
			.call(axisBottom(xScaleTick).tickSize(height + 6));

		const yScale = scaleLinear().domain(loadDomain(events)).nice().range([height, 0]);
		// Y-AXIS HZ Lines
		const yAxisLines = svg
			.append('g')
			.attr('style', 'color: var(--stroke-tertiary)')
			.attr('stroke-dasharray', '4 2')
			.call(
				axisRight(yScale)
					.ticks(6)
					.tickSize(chartWidth)
					.tickFormat('' as null),
			);
		// Y-AXIS TEXT
		const yAxis = svg
			.append('g')
			.attr('style', 'color: var(--stroke-tertiary)')
			.call(axisRight(yScale).ticks(TICKS).tickSize(0));

		xAxis.selectAll('text').attr('stroke', 'none').attr('fill', 'var(--text-tertiary)');
		xAxis.select('domain').attr('style', 'display: none');
		xAxis.select('g.tick > text').attr('transform', 'translate(12, 0)');
		xAxis.select('g.tick:last-child > text').attr('transform', 'translate(-12, 0)');
		yAxisLines.select('domain').attr('style', 'display: none');

		yAxis
			.selectAll('text')
			.attr('stroke', 'none')
			.attr('fill', 'var(--text-tertiary)')
			.attr('transform', 'translate(0, 12)');
		yAxis.selectAll('path').attr('stroke', 'none').attr('fill', 'none');
		yAxis.select('text').attr('stroke', 'none').attr('fill', 'none');

		const line = d3
			.line()
			.x((d) => xScale(dateStringForBlockTime(d[0])))
			.y((d) => yScale(d[1]));

		svg
			.append('path')
			.datum(events.map((event) => [event.timestamp, event.value]))
			.attr('class', 'line')
			.attr('d', line as ValueFn<SVGPathElement, number[][], string>)
			.style('fill', 'none')
			.style('stroke', 'var(--stroke-success)')
			.style('stroke-width', '2');

		///////////////////

		const hoverLine = svg.append('line').attr('y2', height).attr('stroke', '#00000000');
		const hoverCircle = svg
			.append('circle')
			.attr('cx', '50')
			.attr('cy', '50')
			.attr('r', '4')
			.attr('stroke-width', '2')
			.attr('stroke', '#ffffff')
			.attr('fill', 'rgb(245, 163, 18)')
			.attr('style', 'display: none')
			.attr('class', 'hover-circle');

		svg.on('mousemove', function (event) {
			const target = this as SVGElement;
			const rectWidth = target.getClientRects()[0].width;
			const index = Math.floor(event.offsetX / (rectWidth / events.length));
			if (index >= events.length) return;
			const x = (rectWidth / (events.length - 1)) * index;
			hoverLine.attr('stroke', '#00000032').attr('transform', `translate(${x},${0})`);
			hoverCircle
				.attr('cx', `${x}`)
				.attr('cy', `${yScale(events[index]?.value)}`)
				.attr('data', yScale(events[index]?.value))
				.attr('style', '');
			toolTipContent[2] = dateStringForBlockTime(events[index]?.timestamp);
			toolTipContent[3] = events[index]?.value.toFixed(2);
		});

		svg.on('pointerleave', function () {
			hoverLine.attr('stroke', '#00000000');
			hoverCircle.attr('style', 'display: none');
			shownTooltip = false;
		});

		///////////////////
	}

	function drawChart(
		node: SVGElement,
		[chartWidth, eventData, eventDuration]: [number, EventRef[], number],
	) {
		draw(node.id, chartWidth, eventData, eventDuration);
		return {
			update([w, d, dur]: [number, EventRef[], number]) {
				node.innerHTML = '';
				draw(node.id, w, d, dur);
			},
		};
	}

	let chartTarget: SVGSVGElement;
	let tooltipElement: HTMLElement;

	function onPointerEnter() {
		shownTooltip = true;
	}

	function onPointerMove() {
		const circle = chartTarget.querySelector('circle.hover-circle');
		const tooltip = tooltipElement;
		const rect = circle.getBoundingClientRect();
		const chartRect = chartTarget.getBoundingClientRect();
		const tooltipRect = tooltip.getBoundingClientRect();
		let x = rect.left - chartRect.left;
		let y = rect.top - chartRect.top;
		if (chartRect.width <= x + tooltipRect.width + 10) {
			x -= tooltipRect.width + 10;
		} else {
			x += 20;
		}
		if (chartRect.height <= y + tooltipRect.height + 10) {
			y -= tooltipRect.height + 5;
		} else {
			y += 20;
		}
		toolTipContent = [x, y, toolTipContent[2], toolTipContent[3]];
	}

	function onPointerLeave() {
		shownTooltip = false;
	}
</script>

<div class="wrapper">
	<svg
		xmlns="http://www.w3.org/2000/svg"
		version="1.1"
		width="100%"
		height="240"
		id="chart-svg"
		bind:this={chartTarget}
		use:drawChart={[width, data, duration]}
		on:pointerenter={onPointerEnter}
		on:pointermove={onPointerMove}
		on:pointerleave={onPointerLeave}
	/>

	{#if shownTooltip}
		<div
			class="chart-tooltip"
			bind:this={tooltipElement}
			style="transform: translate({toolTipContent[0]}px, {toolTipContent[1]}px);"
		>
			<div style="padding: 10px; border: 1px solid var(--text-tertiary);">
				<div style="font-size: 0.7rem; color: var(--text-tertiary);">{toolTipContent[2]}</div>
				<div><span style="font-family: sans-serif;">Ξ</span>{toolTipContent[3]}</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.wrapper {
		position: relative;
	}
	svg {
		margin-top: 5px;
		width: 100%;
	}
	.chart-tooltip {
		pointer-events: none;
		visibility: visible;
		position: absolute;
		top: 0px;
		left: 0px;
		transition: -webkit-transform 100ms ease 0s;
		z-index: 100;
		color: var(--text-primary);
		background: var(--background-l2);
	}

	/* TODO: Needs ocular inspection to check if breakpoint can be exchanged with constants breakpoint defined here: [$constants/styles/layouts.ts] */
	@media (max-width: 500px) {
		.wrapper {
			width: 100%;
		}
	}
</style>
