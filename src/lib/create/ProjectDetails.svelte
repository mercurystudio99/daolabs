<script context="module">
	export const metadataFields = [
		{
			id: 'name',
			wrapId: 'name-wrap',
			category: 'details',
			label: 'Treasury name',
			placeholder: 'Save the world',
			props: {
				required: true,
				maxlength: 64,
			},
		},
		{
			id: 'description',
			wrapId: 'description-wrap',
			category: 'details',
			label: 'Treasury description',
			type: 'textarea',
			props: {
				maxlength: 5000,
			},
		},
		{
			id: 'infoUri',
			wrapId: 'infoUri-wrap',
			category: 'links',
			label: 'Website',
			placeholder: 'https://your-tresury.com',
			props: {
				type: 'url',
			},
		},
		{
			id: 'twitter',
			wrapId: 'twitter-wrap',
			category: 'links',
			label: 'Twitter handle',
			prefix: '@',
			placeholder: 'your-treasury',
			props: {
				pattern: '([a-zA-Z0-9_%]*)',
			},
		},
		{
			id: 'discord',
			wrapId: 'discord-wrap',
			category: 'links',
			label: 'Discord',
			placeholder: 'https://discord.gg/abcdefgh',
			props: {
				type: 'url',
				pattern: '^((https?://)?discord.gg/)([a-zA-Z0-9]*)',
			},
		},
		{
			id: 'telegram',
			wrapId: 'telegram-wrap',
			category: 'links',
			label: 'Telegram',
			placeholder: 'https://t.me/abcdefgh',
			props: {
				type: 'url',
				pattern: '^((https?://)?t.me/)([a-zA-Z0-9]*)',
			},
		},
		{
			id: 'payButton',
			wrapId: 'payButton-wrap',
			category: 'project_page_customization',
			label: 'Contribute button text',
			placeholder: 'Pay',
			description: 'Customize your treasury\'s "pay" button. Leave blank to use the default.',
			props: {
				maxlength: 16,
			},
		},
		{
			id: 'payDisclosure',
			wrapId: 'payDisclosure-wrap',
			category: 'project_page_customization',
			label: 'Contribution disclosure',
			description: 'Disclose any details to your contributors before they pay into your treasury.',
			type: 'textarea',
			props: {
				maxlength: 256,
			},
		},
	];
</script>

<script lang="ts">
	import { getContext } from 'svelte';
	import { BigNumber } from 'ethers';
	import InfoBox from '$lib/components/InfoBox.svelte';
	import FormField from '$lib/components/FormField.svelte';
	import Input from '$lib/components/Input.svelte';
	import UploadField from '$lib/components/UploadField.svelte';
	import Expandable from '$lib/components/Expandable.svelte';
	import Dropdown from '$lib/components/Dropdown.svelte';
	import Button from '$lib/components/Button.svelte';
	import { getDefaultConfettiOptions, throwConfetti } from '$lib/utils/confetti';
	import PickDropzone from '$lib/components/PickDropzone.svelte';
	import { parseProjectJson } from '$utils/project';
	import { connectTwitter } from '$utils/firebase';
	import type { V2ProjectContextType } from '$models/project-type';
	import type Store from '$utils/Store';
	import type confetti from 'canvas-confetti';

	const project: Store<V2ProjectContextType> = getContext('PROJECT');

	export let info =
		'You can edit your treasury details after creation at any time, but the transaction will cost gas.';
	export let setValid: (disabled: boolean) => void;
	export let twitterSignedAndVerified = false;

	const details = metadataFields.filter((field) => field.category === 'details');
	const links = metadataFields.filter((field) => field.category === 'links');
	const projectPageCustomization = metadataFields.filter(
		(field) => field.category === 'project_page_customization',
	);

	function onLogoChange(src: string) {
		project.update((state: V2ProjectContextType) => ({
			...state,
			projectMetadata: {
				...state.projectMetadata,
				logoUri: src,
			},
		}));
	}

	const onValid = (e: CustomEvent<{ value: boolean }>) => setValid(e.detail.value);

	let editingConfettiInstance = 0;
	let useModifiedConfettiConfig = !$project.confetti.useDefault;
	$: $project.confetti.useDefault = !useModifiedConfettiConfig;
	$: if (!useModifiedConfettiConfig) {
		$project.confetti = getDefaultConfettiOptions();
	}

	let playingConfetti = false;
	let confettiPromise: (Promise<unknown> & { stop?: Function }) | undefined;
	async function playConfetti() {
		playingConfetti = true;
		try {
			const promise = throwConfetti(
				$project.confetti.seconds,
				JSON.parse(JSON.stringify($project.confetti.onPay)) as unknown as [
					confetti.Options,
					confetti.Options,
				],
				$project.projectId instanceof BigNumber,
			);
			confettiPromise = promise;
			await promise;
		} catch (e) {
			//
			console.error(e);
		}
		playingConfetti = false;
	}

	function stopConfetti() {
		if (typeof confettiPromise?.stop === 'function') {
			confettiPromise.stop();
		}
	}

	function onBlur(event: Event, callback: (x: number) => void) {
		const target = event.target as HTMLInputElement;
		const min = target?.getAttribute('min');
		const max = target?.getAttribute('max');
		if (typeof min === 'string' && typeof max === 'string') {
			if (min.match(/^\d+$/) && max.match(/^\d+$/)) {
				const minNumber = Number(min);
				const maxNumber = Number(max);
				const value = Number(target.value);
				if (value < minNumber) {
					callback(minNumber);
				} else if (value > maxNumber) {
					callback(maxNumber);
				}
			}
		}
	}

	let importingProjectJson = false;
	async function handleProjectJson(event: CustomEvent<File[]>) {
		const [file] = event.detail ?? [];
		if (file) {
			const text = await file.text();
			if (text) {
				try {
					const result = parseProjectJson(JSON.parse(text), [
						'projectId',
						'events',
						'createdAt',
						'totalVolume',
						'projectOwnerAddress',
						'balanceInDistributionLimitCurrency',
						'usedDistributionLimit',
						'hasIssueTicketsPermissions',
					]);

					console.log(result);
					$project = { ...$project, ...result };
					useModifiedConfettiConfig = !$project.confetti.useDefault;
					console.log($project);
					importingProjectJson = false;
					if ($project.projectMetadata?.name) {
						setValid(true);
					}
				} catch (error) {
					if (error instanceof Error) {
						console.error(error.message);
					} else {
						console.error(error);
					}
				}
			}
		}
	}

	async function handleTwitterAuth() {
		const { username, signature } = await connectTwitter();

		$project.projectMetadata.twitter = username;
		$project.projectMetadata.twitterSignature = signature;
	}
</script>

<Expandable
	bind:expanded={importingProjectJson}
	title="Import treasury json"
	titleColor="var(--text-header)"
>
	<span id="icon-wrap">
		<PickDropzone accept={['.json']} on:select={handleProjectJson} />
	</span>
	<br />
</Expandable>

{#each details as field}
	<span id={field.wrapId}>
		<FormField {field} on:valid={onValid} bind:value={$project.projectMetadata[field.id]} />
	</span>
{/each}

<span id="icon-wrap">
	<UploadField
		accept=".png, .jpg, .jpeg, .gif, .bmp, .ico, .tiff, .svg, .ai, .psp, .pcd, .pct, .raw"
		onChange={onLogoChange}
		url={$project.projectMetadata?.logoUri || ''}
	/>
</span>

<h3>Links</h3>
{#each links as field}
	<span id={field.wrapId}>
		<FormField {field} on:valid={onValid} bind:value={$project.projectMetadata[field.id]} />
	</span>
	{#if field.id === 'twitter'}
		{#if twitterSignedAndVerified}
			<div class="connectTwitterButton">
				<Button
					size="sm"
					type="secondary"
					buttonProps={{ style: 'margin-top: 6px;pointer-events: none;' }}
					disabled
				>
					connected!
				</Button>
			</div>
		{:else}
			<div class="connectTwitterButton">
				<Button
					size="sm"
					type="secondary"
					buttonProps={{ style: 'margin-top: 6px;' }}
					on:click={handleTwitterAuth}>Reconnect Twitter</Button
				>
			</div>
		{/if}
	{/if}
{/each}

<h3>Treasury page customization</h3>
{#each projectPageCustomization as field}
	<span id={field.wrapId}>
		<FormField {field} on:valid={onValid} bind:value={$project.projectMetadata[field.id]} />
	</span>
{/each}

<br />

<Expandable
	bind:expanded={useModifiedConfettiConfig}
	title="Confetti"
	titleColor="var(--text-header)"
>
	<Dropdown
		options={$project.confetti.onPay.map((opts, index) => ({
			label: ['Left', 'Right'][index],
			value: index,
		}))}
		bind:value={editingConfettiInstance}
	/>
	<br />
	<div class="confetti-instance">
		<label for="particleCount">
			<span>particles</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.onPay[editingConfettiInstance].particleCount}
					min={0}
					max={15}
					on:blur={(e) =>
						onBlur(e, (x) => ($project.confetti.onPay[editingConfettiInstance].particleCount = x))}
				/>
			</div>
		</label>
		<label for="angle">
			<span>angle</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.onPay[editingConfettiInstance].angle}
					min={0}
					max={360}
					on:blur={(e) =>
						onBlur(e, (x) => ($project.confetti.onPay[editingConfettiInstance].angle = x))}
				/>
			</div>
		</label>
		<label for="spread">
			<span>spread</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.onPay[editingConfettiInstance].spread}
					min={10}
					max={200}
					on:blur={(e) =>
						onBlur(e, (x) => ($project.confetti.onPay[editingConfettiInstance].spread = x))}
				/>
			</div>
		</label>
		<label for="startVelocity">
			<span>velocity</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.onPay[editingConfettiInstance].startVelocity}
					min={10}
					max={100}
					on:blur={(e) =>
						onBlur(e, (x) => ($project.confetti.onPay[editingConfettiInstance].startVelocity = x))}
				/>
			</div>
		</label>
		<label for="decay">
			<span>decay</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.onPay[editingConfettiInstance].decay}
					min={0}
					max={10}
					on:blur={(e) =>
						onBlur(e, (x) => ($project.confetti.onPay[editingConfettiInstance].decay = x))}
				/>
			</div>
		</label>
		<label for="gravity">
			<span>gravity</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.onPay[editingConfettiInstance].gravity}
					min={0}
					max={30}
					on:blur={(e) =>
						onBlur(e, (x) => ($project.confetti.onPay[editingConfettiInstance].gravity = x))}
				/>
			</div>
		</label>
		<label for="drift">
			<span>drift</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.onPay[editingConfettiInstance].drift}
					min={-20}
					max={20}
					on:blur={(e) =>
						onBlur(e, (x) => ($project.confetti.onPay[editingConfettiInstance].drift = x))}
				/>
			</div>
		</label>
		<label for="ticks">
			<span>ticks</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.onPay[editingConfettiInstance].ticks}
					min={10}
					max={2000}
					on:blur={(e) =>
						onBlur(e, (x) => ($project.confetti.onPay[editingConfettiInstance].ticks = x))}
				/>
			</div>
		</label>
		<label for="x">
			<span>origin-x</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.onPay[editingConfettiInstance].origin.x}
					min={0}
					max={1}
					on:blur={(e) =>
						onBlur(e, (x) => ($project.confetti.onPay[editingConfettiInstance].origin.x = x))}
				/>
			</div>
		</label>
		<label for="y">
			<span>origin-y</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.onPay[editingConfettiInstance].origin.y}
					min={0}
					max={1}
					on:blur={(e) =>
						onBlur(e, (x) => ($project.confetti.onPay[editingConfettiInstance].origin.y = x))}
				/>
			</div>
		</label>
		<label for="seconds">
			<span>seconds</span>
			<div>
				<Input
					type="number"
					bind:value={$project.confetti.seconds}
					min={5}
					max={30}
					on:blur={(e) => onBlur(e, (x) => ($project.confetti.seconds = x))}
				/>
			</div>
		</label>
		<label for="seconds">
			<span>&nbsp;</span>
			<div style="display: flex;justify-content: flex-end;">
				{#if playingConfetti}
					<Button size="xl" fullWidth on:click={stopConfetti}>Stop</Button>
				{:else}
					<Button size="xl" fullWidth on:click={playConfetti}>Play</Button>
				{/if}
			</div>
		</label>
	</div>
	<br />
</Expandable>

<InfoBox {info} />
<br />

<style>
	h3 {
		color: var(--text-header);
	}

	h3:not(:first-of-type) {
		color: var(--text-header);
		margin-top: 40px;
	}
	.confetti-instance {
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem;
	}
	.connectTwitterButton {
		display: flex;
		justify-content: end;
	}
	label {
		width: 70px;
		min-width: min-content;
	}
	label > span {
		font-size: 0.8rem;
		font-family: monospace;
		text-transform: capitalize;
		margin-bottom: 0.25rem;
		display: inline-block;
	}
</style>
