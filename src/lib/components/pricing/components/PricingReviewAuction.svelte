<script lang="ts">
	// import moment from 'moment';
	import { format } from 'date-fns';

	// Exports variables
	export let method;
	export let startingDate: string;
	export let endingDate: string;
	export let startingTime: string;
	export let endingTime: string;
	export let price;
	export let reserve;

	// Local variables and constants
	const methods = {
		fixed: 'Fixed price',
		declining: 'Sell with declining price',
		highest: 'Sell to highest bidder',
	};

	// Functions
	function formatDate(date: string) {
		// return moment(date).format('D MMM YY');
		return format(new Date(date), 'd MMM yy');
	}
	function formatTime(date: string) {
		// return moment(date).format('h:mm A');
		return format(new Date(date), 'h:mm a');
	}
</script>

<div class="review">
	<div>Method: {methods[method]}</div>
	<div>Starting price: {price} ETH</div>
	<div>
		Duration: {formatDate(startingDate)} ({formatTime(startingTime ? startingTime : startingDate)})
		- {formatDate(endingDate)} ({formatTime(endingTime ? endingTime : endingDate)})
	</div>
	<div>Include reserve price: {reserve} ETH</div>
</div>

<style lang="scss">
	.review {
		padding: 8px;
		border: 0.4px solid var(--stroke-tertiary);
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 4px;
		height: 120px;
		font-weight: 300;
		width: 100%;
		margin-bottom: 16px;
	}
</style>
