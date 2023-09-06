<script>
	import ScrollTrophy from './ScrollTrophy.svelte';
</script>

<div class="intro-container">
	<div class="text-card">
		<h1>Leadership</h1>

		<p>
			Establish trust with your community by connecting your wallet to Twitter accounts. Display
			your projects’ Twitter feed on your treasury landing page. Add hashtags to your profile to
			signal what you care about.
		</p>

		<div class="list__container">
			<div class="list__header">Enables</div>
			<ul>
				<li>Transparent project owners signal accountability</li>
				<li>Twitter feeds connected to treasury landing pages to disseminate your vision</li>
				<li>Signal to upcoming communities your interests to foster collaborations</li>
			</ul>
		</div>
	</div>
	<ScrollTrophy />
</div>
<div class="buttons-container">
	<button class="twitter"><div class="twitter__text">Connect Twitter</div></button>
	<button class="search"><div class="search__text">Search #tags</div></button>
</div>

<style lang="scss">
	.intro-container {
		display: flex;
		flex-direction: row;
		align-items: center;
		min-height: 523px;
		// justify-content: space-evenly;
		flex-wrap: wrap;
		padding: 0px;
		gap: 21px;
		margin-left: 9.44%;
		margin-right: 9.44%;
		margin-top: 9.44%;

		.text-card {
			/* Frame 71 */

			/* Auto layout */
			display: flex;
			flex-direction: column;
			align-items: flex-start;
			padding: 0px;
			gap: 21px;

			width: 590px;
			height: 475px;

			/* Inside auto layout */
			flex: none;
			order: 0;
			flex-grow: 1;

			h1 {
				/* Leadership */

				width: 578px;
				height: 45px;

				/* H1 */
				font-family: 'DM Mono';
				font-style: normal;
				font-weight: 500;
				font-size: 38.4px;
				line-height: 46px;
				/* or 120% */
				letter-spacing: 0.035em;

				color: #f5a312;

				mix-blend-mode: normal;

				/* Inside auto layout */
				flex: none;
				order: 0;
				flex-grow: 0;
			}

			p {
				width: 578px;
				height: 150px;

				/* Body 1 */

				font-family: 'DM Mono';
				font-style: normal;
				font-weight: 400;
				font-size: 16px;
				line-height: 25px;
				/* or 156% */

				letter-spacing: -0.002em;

				color: #000000;

				mix-blend-mode: normal;

				/* Inside auto layout */
			}

			.list__container {
				display: flex;
				flex-direction: column;
				gap: 13px;

				.list__header {
					font-weight: 500;
					font-size: 14px;
					line-height: 25px;
					/* identical to box height, or 179% */

					letter-spacing: 0.07em;

					color: #e9a63d;
				}
				ul {
					padding-left: 0px;
					display: flex;
					flex-direction: column;
				}

				li {
					margin: 0;
					padding-left: 25px;
					margin-bottom: 12px;
					// padding: 25px 0 36px 84px;
					list-style: none;
					background-image: url('/images/bolt.png');
					background-repeat: no-repeat;
					// background-position: left center;
					background-size: 14px 25px;

					white-space: normal;
					float: left;
					width: 328px;
					height: auto;
					word-wrap: break-word;

					font-family: 'DM Mono';
					font-style: italic;
					font-weight: 500;
					font-size: 14px;
					line-height: 22px;
					/* or 157% */

					letter-spacing: 0.07em;

					color: #000000;

					mix-blend-mode: normal;

					/* Inside auto layout */

					flex: none;
					order: 1;
					flex-grow: 0;
				}
			}
		}
	}

	.buttons-container {
		width: 517px;
		margin-left: 9.44%;
		margin-bottom: 59px;
		display: flex;
		gap: 27px;

		button.twitter {
			width: 180px;
			height: 40px;
			left: 0px;
			top: 0px;

			/* Light/Action/Primary */

			background: #18b4c7;
			border: 1px solid rgba(50, 200, 219, 0.44);
			border-radius: 1px;

			.twitter__text {
				color: #ffffff;
			}
		}
		button.search {
			box-sizing: border-box;

			width: 180px;
			height: 40px;

			/* Light / Stroke / Action / Secondary */
			border: 1px solid rgba(50, 200, 219, 0.44);
			border-radius: 1px;

			.search__text {
				text-align: center;
				letter-spacing: -0.005em;
				color: #18b4c7;
			}
		}
	}
</style>
