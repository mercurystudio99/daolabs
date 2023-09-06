import { marked } from 'marked';
import linker from 'autolinker';

export function markdownToHtml(markdown: string) {
	markdown = linker.link(markdown.replace(/\]\(/g, '] ('), {
		sanitizeHtml: true,
		truncate: {
			length: 30,
			location: 'smart',
		},
	});
	const regex =
		/\[(<a href=")([a-zA-Z0-9:./]*)("[a-zA-Z0-9:./ _="<>]*)(\] \(<a href=")([a-zA-Z0-9:./]*)("[a-zA-Z0-9:./ _="<>]*\))/g;
	const linkText = '$1$5$3';
	markdown = markdown.replace(regex, linkText);

	return marked(markdown, <unknown>{
		html: true,
		linkify: true,
		typographer: true,
	});
}
