import fs from 'fs';
import data from '../src/constants/tokens.json' assert { type: 'json' };

// check if the tokenlist is older than 1 week
const oneWeek = 1000 * 60 * 60 * 24 * 7;
const timestamp = new Date(data.timestamp);
const now = new Date().getTime();
if (now - timestamp > oneWeek) {
	console.info('Token list is older than 1 week');
	fetch('https://tokens.coingecko.com/uniswap/all.json')
		.then((response) => {
			return response.json();
		})
		.then((json) => {
			data = json;
			fs.writeFileSync('./src/constants/tokens.json', JSON.stringify(json, null, 4));
		});
}

const tokensKeyedByAddress = data.tokens.reduce((acc, token) => {
	acc[token.address] = token;
	return acc;
}, {});

fs.writeFileSync(
	'./src/constants/tokensByAddress.json',
	JSON.stringify(tokensKeyedByAddress, null, 4),
);
