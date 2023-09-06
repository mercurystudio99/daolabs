import fs from 'fs';

import svgByName from '../src/lib/components/Icon/svgByName.js';

const svgByNameSorted = Object.keys(svgByName)
	.sort((a, b) => a.localeCompare(b))
	.reduce((acc, key) => {
		acc[key] = svgByName[key];
		return acc;
	}, {});

const svgByNameSortedString = JSON.stringify(svgByNameSorted, null, 4);

fs.writeFileSync(
	'./src/lib/components/Icon/svgByName.js',
	`export default ${svgByNameSortedString};`,
);
