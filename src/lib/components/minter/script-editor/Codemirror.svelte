<script lang="ts">
	import { onMount } from 'svelte';
	import { EditorView, basicSetup } from 'codemirror';
	import { EditorState, StateEffect, type Extension } from '@codemirror/state';
	import { oneDark } from '@codemirror/theme-one-dark';
	import { javascript } from '@codemirror/lang-javascript';
	import { json } from '@codemirror/lang-json';
	import { autocompletion } from '@codemirror/autocomplete';
	import { darkMode } from '$stores';
	import { LinkViewPlugin } from './helpers';

	export let value = '';
	export let readOnly = false;
	export let language: 'javascript' | 'json' = 'javascript';

	let divEl: HTMLDivElement = null;
	let editor: EditorView;

	let basicExtensions = [
		basicSetup,
		autocompletion(),
		EditorView.editable.of(!readOnly),
		EditorView.lineWrapping,
		EditorView.updateListener.of((update) => {
			if (update.docChanged) {
				value = update.state.doc.toString();
			}
		}),
	];

	function injectExtension(view: EditorView, extension: Extension) {
		view.dispatch({
			effects: StateEffect.appendConfig.of(extension),
		});
	}

	function deconfigure(view: EditorView) {
		view.dispatch({
			effects: StateEffect.reconfigure.of(basicExtensions),
		});
	}

	$: darkMode.subscribe((isDark) => {
		if (editor) {
			if (isDark) {
				injectExtension(editor, oneDark);
			} else {
				deconfigure(editor);
			}
		}
	});

	onMount(() => {
		if (language === 'json') {
			basicExtensions.push(json());
			basicExtensions.push(LinkViewPlugin);
		} else {
			basicExtensions.push(javascript());
		}

		editor = new EditorView({
			state: EditorState.create({
				doc: value,
				extensions: basicExtensions,
			}),
			parent: divEl,
		});
	});
</script>

<div bind:this={divEl} />

<style>
	div {
		box-sizing: border-box;
		width: 100%;
		flex-grow: 1;
		border: 1px solid var(--text-tertiary);
		overflow: auto;
	}

	:global(.cm-link) {
		text-decoration: underline;
		cursor: pointer;
		font-style: italic;
		color: var(--stroke-tertiary);
	}
</style>
