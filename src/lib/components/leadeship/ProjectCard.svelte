<script lang="ts">
	export let projectTag: string;
	export let projectAddres: string;
	export let projectName: string;
	export let hashTags: [string, string, string];
</script>

<div class="projectCard">
	<div class="projectCard__container">
		<img src="" alt="" />
		<div class="projectDetails">
			<div class="projectTag">{projectTag}</div>
			<div class="projectAddres">{projectAddres}</div>
			<div class="projectName">{projectName}</div>
		</div>
	</div>

	<div class="hashTags">{hashTags.join(' ')}</div>
</div>

<style lang="scss">
	.projectCard {
		box-sizing: border-box;
		width: 280px;
		height: 200px;

		border: 1px solid #e3e2df;

		.projectCard__container {
			display: flex;
			align-items: center;
			gap: 24px;

			margin-left: 20px;
			margin-right: 21px;
			margin-top: 52.5px;
			margin-bottom: 19.5px;

			img {
				width: 80px;
				height: 80px;
			}

			.projectDetails {
				display: flex;
				flex-direction: column;
				align-items: flex-start;
				padding: 0px;
				gap: 11px;

				width: 135px;
				height: 95px;

				.projectTag {
					font-size: 16px;
					line-height: 26px;
					/* identical to box height, or 162% */

					letter-spacing: 0.000714998em;

					color: #111110;

					mix-blend-mode: normal;
				}

				.projectAddres {
					font-size: 14px;
					line-height: 21px;
					/* identical to box height, or 150% */

					letter-spacing: -0.0043em;

					color: rgba(0, 0, 0, 0.6);
				}

				.projectName {
					font-size: 16px;
					line-height: 26px;
					/* identical to box height, or 162% */

					letter-spacing: 0.000714998em;

					color: #e9a63d;

					mix-blend-mode: normal;
				}
			}
		}

		.hashTags {
			font-size: 14px;
			line-height: 24px;
			/* identical to box height, or 171% */

			color: #7fcec9;
			text-align: center;
		}
	}
</style>
