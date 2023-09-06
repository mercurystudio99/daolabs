<script>
	export let width = '24';
	export let height = '24';
	export let active = false;
</script>

<svg {width} {height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
	<mask id="path-1-inside-1_4503_70083" fill="white">
		<rect width="24" height="24" rx="1" />
	</mask>
	<rect
		width="24"
		height="24"
		rx="1"
		stroke={active ? 'var(--stroke-primary)' : 'var(--stroke-secondary)'}
		stroke-width="4"
		mask="url(#path-1-inside-1_4503_70083)"
	/>
	<line
		x1="16"
		x2="16"
		y2="24"
		stroke={active ? 'var(--stroke-primary)' : 'var(--stroke-secondary)'}
		stroke-width="2"
	/>
	<line
		x1="8"
		x2="8"
		y2="24"
		stroke={active ? 'var(--stroke-primary)' : 'var(--stroke-secondary)'}
		stroke-width="2"
	/>
	<line
		y1="16"
		x2="24"
		y2="16"
		stroke={active ? 'var(--stroke-primary)' : 'var(--stroke-secondary)'}
		stroke-width="2"
	/>
	<line
		y1="9"
		x2="24"
		y2="9"
		stroke={active ? 'var(--stroke-primary)' : 'var(--stroke-secondary)'}
		stroke-width="2"
	/>
</svg>
