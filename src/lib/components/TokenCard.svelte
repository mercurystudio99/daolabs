<script lang="ts">
	import Icon from '$lib/components/Icon';
	import OwnerCrown from './OwnerCrown.svelte';

	export let token: {
		tokenUri: string;
		owner: string;
		ownersAvatar: string;
		name: string;
	};
</script>

<div class="token">
	<img class="image" src={token.tokenUri} alt="" />
	<div class="info">
		<img class="avatar" src={token.ownersAvatar} alt="" />
		<div class="text">
			<span>{token.name}</span>
			<span class="owner">
				{token.owner}
				<div class="crown">
					<OwnerCrown />
				</div>
			</span>
		</div>
		<div class="info">
			<Icon name="infoCircle" />
		</div>
	</div>
</div>

<style lang="scss">
	.token {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.25);
		border: 1px solid var(--stroke-secondary);

		.image {
			width: 100%;
			height: 100%;
		}
		.info {
			display: flex;
			gap: 16px;
			padding: 8px 16px;

			.avatar {
				width: 2.6em;
				height: 2.6em;
				border-radius: 50%;
				align-self: center;
			}
			.text {
				display: flex;
				flex-direction: column;

				.owner {
					display: flex;
					align-items: center;
					gap: 8px;
					color: var(--text-secondary);

					.crown {
						color: var(--icon-action-primary);
						height: 21px;
					}
				}
			}
			.info {
				align-items: center;
				margin-left: auto;
			}
		}
	}
</style>
