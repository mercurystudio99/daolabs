<script lang="ts">
	import { modal, modalOptions } from '$stores';
	import Modal from '$lib/components/Modal.svelte';
	import CreateProject from '$lib/create/CreateProject.svelte';

	let projectType: ProjectType;
</script>

<svelte:head>
	<title>Create treasury | MOVEMENT</title>
	<script src="/libs/introjs/intro.js"></script>
	<link rel="stylesheet" href="/libs/introjs/introjs.css" />
</svelte:head>

<CreateProject {projectType} />

<Modal show={$modal} {...$modalOptions} />
