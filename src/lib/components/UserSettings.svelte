<script lang="ts">
	import Button from './Button.svelte';
	import Drawer from './minter/drawer/Drawer.svelte';
	import HeavyBorderBox from './HeavyBorderBox.svelte';
	import InfoBox from './InfoBox.svelte';

	import TwitterBox from './settings/TwitterBox.svelte';
	import IdentityServices from './settings/IdentityServices.svelte';
	import ConnectCreditCard from './settings/ConnectCreditCard.svelte';

	export let openDrawer = false;
	export let closeDrawer = () => (openDrawer = !openDrawer);
</script>

<Drawer open={openDrawer} on:clickAway={closeDrawer} size="650px">
	<button class="close-button" on:click={closeDrawer}>x</button>
	<div class="container">
		<h1 class="drawer-title">User Settings</h1>
		<div class="info">
			<InfoBox
				info="Please review our <a href='#'>Terms of Use</a> and <a href='#'>Privacy Policy</a> regarding the information you give us access to."
			/>
		</div>
		<div class="heavy-border-box">
			<HeavyBorderBox>
				<span class="card-title">Advanced</span>
				<p>
					By default we display settings which are necessary for you to set for general website
					functionality, however if you want access to more features...
				</p>
				<div class="box-button"><Button>Advanced Mode Enable</Button></div>
			</HeavyBorderBox>
		</div>
		<div class="info">
			<InfoBox
				info="The following secure authentication sign-in services are designed to improve the sign-in and onboarding experience for non-crypto users."
			/>
		</div>
		<div class="heavy-border-box">
			<TwitterBox />
		</div>
		<div class="heavy-border-box">
			<IdentityServices />
		</div>
		<div class="heavy-border-box">
			<HeavyBorderBox>
				<span class="card-title">Add Payments to Account</span>
				<p>
					Adding a valid credit card enables JuiceBox Payments to route traditional payments to
					treasuries of your choice and access to other application services.
				</p>
				<div class="box-button"><Button>Continue</Button></div>
			</HeavyBorderBox>
		</div>
		<div class="heavy-border-box">
			<ConnectCreditCard />
		</div>
	</div>
</Drawer>

<style lang="scss">
	.card-title {
		color: var(--text-header);
		font-weight: 400;
		margin: 0;
		margin-bottom: 10px;
		font-size: 16px;
		display: block;
	}
	.close-button {
		position: absolute;
		top: 0;
		right: 0;
		z-index: 10;
		display: block;
		padding: 20px;
		color: var(--text-primary);
		font-weight: 700;
		font-size: 16px;
		font-style: normal;
		line-height: 1;
		text-align: center;
		text-transform: none;
		text-decoration: none;
		background: transparent;
		border: 0;
		outline: 0;
		cursor: pointer;
		transition: color 0.3s;
		text-rendering: auto;
	}
	.container {
		font-size: 14px;
		line-height: 1.5715;
		word-wrap: break-word;

		.drawer-title {
			color: var(--text-header);
			font-size: 21px;
		}

		.info,
		.heavy-border-box {
			margin-bottom: 20px;
		}
		.heavy-border-box {
			.box-button {
				display: flex;
				justify-content: flex-end;
			}
		}
	}
</style>
