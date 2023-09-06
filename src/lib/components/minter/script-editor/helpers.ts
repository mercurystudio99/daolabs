import {
	Decoration,
	MatchDecorator,
	ViewPlugin,
	ViewUpdate,
	type PluginValue,
} from '@codemirror/view';
import type { EditorView } from 'codemirror';

const urlRegex =
	/((https?:\/\/|www\.)([^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()[\]{};:'".,<>?«»“”‘’]))/g;

const linkDecorator = new MatchDecorator({
	regexp: urlRegex,
	decoration: (match) => {
		const url = match[0];
		return Decoration.mark({
			tagName: 'a',
			attributes: {
				href: url,
				rel: 'nofollow',
				class: 'cm-link',
				target: '_blank',
			},
		});
	},
});

export class LinkPlugin implements PluginValue {
	decorator: MatchDecorator;

	decorations: any;

	constructor(view: EditorView) {
		this.decorator = linkDecorator;
		this.decorations = this.decorator.createDeco(view);
	}

	update(update: ViewUpdate) {
		if (update.docChanged || update.viewportChanged) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
			this.decorations = this.decorator.updateDeco(update, this.decorations);
		}
	}
}

export const LinkViewPlugin = ViewPlugin.fromClass(LinkPlugin, {
	// eslint-disable-next-line @typescript-eslint/no-unsafe-return
	decorations: (v) => v.decorations,
});
