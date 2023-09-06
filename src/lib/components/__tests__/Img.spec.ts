import { render, screen } from '@testing-library/svelte';
import Img from '$lib/components/Img.svelte';

describe('Test Counter.svelte', () => {
	it('has src attribute when prop src is set', () => {
		const wrapper = render(Img, {
			props: {
				src: '/foo/bar',
			},
		});
		const testImg = document.querySelector('img');
		expect(testImg.src).toBeDefined();
		expect(testImg.src).toEqual('http://localhost:3000/foo/bar');
		expect(testImg.attributes.getNamedItem('width')).toBeNull();
		expect(testImg.attributes.getNamedItem('height')).toBeNull();
		console.log(testImg.classList);
		wrapper.unmount();
	});

	it('should be shown skeleton if loading true', () => {
		const wrapper = render(Img, {
			props: {
				src: '/foo/bar',
			},
		});

		wrapper.component.$set({ loading: true });

		const skeleton = document.getElementsByClassName('skeleton');
		expect(skeleton.length).toEqual(1);
	});
	it.todo('should be shown failed slot if failed true and exists failed slot');
	it.todo('should be shown failed message if failed true');
	it.todo('should be shown image');

	it.todo('should be exists alt');

	it.todo('default does not have attributes alt, width, or height');
});
