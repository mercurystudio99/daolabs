<script lang="ts">
	import { setContext } from 'svelte';
	import { writable } from 'svelte/store';
	import { themeContextKey } from '../../context';

	export let theme = {};
	export let prefix = '--sc-theme';
	export let defaultTheme;
	let appliedTheme: Record<string, string>;

	const store = writable();
	setContext(themeContextKey, store);
	const getStyle = (obj: Record<string, string>) =>
		Object.entries(obj)
			.map(([k, v]) => `${prefix}-${k}: ${v}`)
			.join(';');
	const getTheme = (
		defaults: Record<string, string>,
		overrides: Record<string, Record<string, any>> = {},
		base = '',
	): Record<string, string> =>
		Object.entries(defaults).reduce((acc, [k, v]) => {
			if (typeof v === 'object')
				return { ...acc, ...getTheme(v, overrides[k], [base, k].filter(Boolean).join('-')) };
			return { ...acc, [[base, k].filter(Boolean).join('-')]: overrides[k] || v };
		}, {});

	$: appliedTheme = getTheme(defaultTheme as Record<string, any>, theme);
	$: style = getStyle(appliedTheme);
	$: store.set(appliedTheme);
</script>

<slot {appliedTheme} {style} />
