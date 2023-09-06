<script lang="ts">
	export let projectName: string;
	export let projectPrice: string;
	export let percentageChange: string;
	export let priceChange: string;
</script>

<div class="ProjectCard">
	<img src="" alt="" />

	<div class="ProjectCard__projectInfo">
		<div class="ProjectCard__projectDetails">
			<h4 class="ProjectCard__projectName">{projectName}</h4>

			<div class="price-container">
				<div class="ProjectCard__price">Floor price:</div>
				<div class="ProjectCard__projectPrice">{projectPrice}</div>
			</div>
		</div>

		<div class="priceChange-container">
			<div class="percentageChange {percentageChange.includes('+') ? 'positive' : 'negative'}">
				{percentageChange}
			</div>
			<div class="priceChange">{priceChange}</div>
		</div>
	</div>
</div>

<style lang="scss">
	.ProjectCard {
		display: flex;
		align-items: center;
		padding: 20px 21px 20px 20px;
		gap: 20px;

		width: 563px;
		height: 120px;

		border: 1px solid #e3e2df;

		img {
			width: 80px;
			height: 80px;

			background: linear-gradient(0deg, rgba(241, 62, 62, 0.2), rgba(241, 62, 62, 0.2));
			border-radius: 50px;
		}
		.ProjectCard__projectInfo {
			display: flex;
			align-items: center;
			gap: 0px;
			.ProjectCard__projectDetails {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				padding: 0px 0px 0px 0px;
				gap: 1px;

				.ProjectCard__projectName {
					width: 303px;
					height: 21px;

					/* H4 */

					font-family: 'DM Mono';
					font-style: normal;
					font-weight: 500;
					font-size: 16px;
					line-height: 20px;
					/* or 125% */

					color: #111110;
					margin-bottom: 0px;
				}
				.price-container {
					display: flex;

					.ProjectCard__price {
						font-size: 14px;
						line-height: 21px;
						/* identical to box height, or 150% */

						display: flex;
						align-items: center;
						letter-spacing: -0.0043em;

						color: #adaba9;
					}

					.ProjectCard__projectPrice {
						font-size: 14px;
						line-height: 21px;
						/* identical to box height, or 150% */

						display: flex;
						align-items: center;
						letter-spacing: -0.0043em;

						color: rgba(17, 17, 16, 0.8);
					}
				}
			}

			.priceChange-container {
				padding-left: -20px;

				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: flex-end;
				padding: 0px 31px 0px 0px;
				gap: 2px;

				width: 140px;
				height: 44px;

				.priceChange {
					letter-spacing: -0.0043em;

					color: rgba(17, 17, 16, 0.8);
				}

				.percentageChange {
					letter-spacing: -0.0043em;
				}

				.positive {
					color: #7fcec9;
				}

				.negative {
					color: rgba(255, 21, 21, 0.6);
				}
			}
		}
	}
</style>
