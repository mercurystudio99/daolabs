<script lang="ts">
	import { constants } from 'ethers';
	import { TokenType, type Token } from '$models/v2/tokens';
	import Button from './Button.svelte';
	import CloseButton from './CloseButton.svelte';
	import HoverDropdown from './HoverDropdown.svelte';
	import Input from './Input.svelte';
	import Trans from './Trans.svelte';

	export let close;
	export let tokens: Token[];
	export let updateTokens: (newTokens: Token[]) => void;

	const addToken = () => {
		tokens = [...tokens, {}];
	};

	const save = () => {
		if (tokens.every((token) => token.type !== undefined && token.value)) {
			updateTokens(tokens);
			close();
		}
	};

	const removeToken = (index: number) => {
		tokens.splice(index, 1);
		tokens = tokens;
	};
</script>

<section>
	<h2><Trans>Token whitelist</Trans></h2>
	<p>
		<Trans>
			Display ERC-20,ERC-721 and other Treasury project tokens for all projects. Addresses in the
			user interface which match will show the
		</Trans>
		<span class="link"><Trans>badge-check icon.</Trans></span>
	</p>
	{#each tokens as token, index}
		<div class="inputs">
			<div class="dropdown">
				<HoverDropdown
					options={[
						{ label: 'ERC-20', value: TokenType.ERC20 },
						{ label: 'ERC-721', value: TokenType.ERC721 },
						{ label: 'Project', value: TokenType.PROJECT },
					]}
					bind:value={token.type}
					placeholder="ERC-20"
				/>
			</div>
			{#if token.type !== undefined}
				<div class="input">
					<Input
						type={token.type !== TokenType.PROJECT ? 'address' : 'text'}
						bind:value={token.value}
						placeholder={token.type !== TokenType.PROJECT ? constants.AddressZero : 'Project ID'}
					/>
				</div>
			{/if}
			<div class="delete">
				<CloseButton
					position="0"
					size="6px"
					color="--text-action-primary"
					on:click={() => removeToken(index)}
				/>
			</div>
		</div>
	{/each}
	<Button size="md" type="tertiary" on:click={addToken}>
		<Trans>Add token</Trans>
	</Button>
	<div class="submit-buttons">
		<Button size="md" type="secondary" on:click={close}>
			<Trans>Cancel</Trans>
		</Button>
		<Button size="md" type="primary" on:click={save}>
			<Trans>Save Tokens</Trans>
		</Button>
	</div>
</section>

<style lang="scss">
	section {
		max-width: 550px;
		display: flex;
		flex-direction: column;
		gap: 16px;

		h2 {
			color: var(--text-header);
			margin: 0;
		}
		p {
			color: var(--text-secondary);
			margin: 0;
		}

		.inputs {
			display: flex;
			position: relative;

			.dropdown {
				flex-basis: 20%;
				margin-right: 16px;
				min-width: 100px;
			}

			.input {
				flex-grow: 1;
			}
			.delete {
				position: absolute;
				top: 8px;
				right: 8px;
				visibility: hidden;
			}

			&:hover {
				.delete {
					visibility: visible;
				}
			}
			&:focus-within {
				.delete {
					visibility: visible;
				}
			}
		}
		.submit-buttons {
			display: flex;
			gap: 12px;
			justify-content: flex-end;
		}
		.link {
			color: var(--text-action-primary);
			cursor: pointer;
		}
	}
</style>
