<script lang="ts">
	import LandingInfo from '$lib/home/LandingInfo.svelte';
	import ProjectsUsingJuice from '$lib/home/ProjectsUsingJuice.svelte';
	import TrendingProjects from '$lib/home/TrendingProjects.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import TrendingCollections from '$lib/home/TrendingCollections.svelte';
	import NotableCollections from '$lib/home/NotableCollections.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import { modal } from '$stores';
</script>

<svelte:head>
	<title>MOVEMENT</title>
</svelte:head>

<LandingInfo />
<TrendingProjects />
<ProjectsUsingJuice />
<NotableCollections />
<TrendingCollections />
<Footer />

<Modal show={$modal} closeButton={false} closeOnOuterClick={false} />
