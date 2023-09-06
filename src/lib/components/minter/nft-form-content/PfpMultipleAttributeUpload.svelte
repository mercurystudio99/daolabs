<script lang="ts">
	import {
		initialPfpAttribute,
		initialPfpProperty,
		NftStatus,
		PfpConstraintType,
		type PfpAttribute,
		type PfpNftConfig,
	} from '$models/minter/nft-config';
	import { generateId } from '$lib/utils/generateId';
	import UploadDropzone from '$lib/components/UploadDropzone.svelte';
	import { deepCopy } from '$utils/object';
	import type { DropzoneOutput, FileWithPath } from '$models/minter/dropzone';

	export let form: PfpNftConfig;
	export let uploadLoading: boolean;

	const constraintRegex = /\s([cp])\s(\d+)$/;

	function removeExtension(filename: string) {
		return filename.split('.').slice(0, -1).join('');
	}

	function extractNameFromFileName(filename: string) {
		/**
		 * Given a string in the form foo_foo_foo_.png, or foo-foo-foo.png,
		 * return foo foo foo
		 */
		return removeExtension(filename).split(/[-_]/).join(' ');
	}

	function extractConstraintsFromFileName(filename: string) {
		/**
		 * c_[number] which means a constraint of finite count of number c or
		 * p_[number] which means a constaint of percent of number p
		 */
		const match = filename.match(constraintRegex);

		if (match) {
			const type = match[1] === 'c' ? PfpConstraintType.COUNT : PfpConstraintType.PERCENTAGE;
			const value = parseInt(match[2]);
			return { type, value };
		}
		return { type: PfpConstraintType.NONE, value: 0 };
	}

	function extractInfoFromFileName(filename: string): [
		string,
		string,
		{
			type: PfpConstraintType;
			value: number;
		},
	] {
		/**
		 * Given a string in the form Traits/attribute_name/foo_foo.png return attribute_name, foo foo
		 * oor a string in the form of attribute_name/foo_foo.png return attribute_name, foo foo
		 */
		const list = filename.split('/');
		const attribute = list[list.length - 2];
		let name = extractNameFromFileName(list[list.length - 1]);
		const constraint = extractConstraintsFromFileName(name);
		name = name.replace(constraintRegex, '');
		return [attribute, name, constraint];
	}

	function createAttribute(name: string): PfpAttribute {
		const attribute = { ...initialPfpAttribute };
		attribute._id = generateId();
		attribute._status = NftStatus.SAVED;
		attribute.name = name;
		attribute.properties = [];
		return attribute;
	}

	const handlePropertySelect = (
		file: DropzoneOutput,
		acceptedFiles: FileWithPath[],
		index: number,
	) => {
		const [attributeName, name, constraint] = extractInfoFromFileName(acceptedFiles[index].path);
		const initial = deepCopy(initialPfpProperty);
		const property = {
			...initial,
			file,
			_id: generateId(),
			fileName: acceptedFiles[index].name,
			name,
			constraint,
		};

		let attribute = form.layers.find((attr) => attr.name === attributeName);

		if (!attribute) {
			attribute = createAttribute(attributeName);
			// Rename attribute here..?
			form.layers = [...form.layers, attribute];
		}

		attribute.properties = [...attribute.properties, property];
	};

	function handleUploadDone() {
		const regex = /^(\d+)\D/;

		const shouldSort = form.layers.some((attr) => regex.test(attr.name));
		if (!shouldSort) {
			return;
		}
		// sort in the order of [number]_string
		form.layers = form.layers.sort((a, b) => {
			const aNumber = parseInt(a.name.match(regex)?.[1]);
			const bNumber = parseInt(b.name.match(regex)?.[1]);

			// if either aNumber or bNumber is NaN, but the other is a number
			// then return the number
			if (isNaN(aNumber) && !isNaN(bNumber)) {
				return 1;
			}
			if (!isNaN(aNumber) && isNaN(bNumber)) {
				return -1;
			}
			return aNumber - bNumber;
		});
		// remove the _[number] from the attribute name
		form.layers = form.layers.map((attr) => {
			attr.name = attr.name.replace(regex, '');
			return attr;
		});
	}
</script>

<UploadDropzone
	accept={['.png', '.jpg', '.jpeg', '.svg']}
	label={'Add directory of properties'}
	onDrop={handlePropertySelect}
	multiple
	directory
	bind:loading={uploadLoading}
	on:done={handleUploadDone}
/>
