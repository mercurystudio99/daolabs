import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const networks = fs
	.readdirSync(path.resolve(__dirname, '../src/deployments/'))
	.filter((file) =>
		fs.lstatSync(path.resolve(__dirname, '../src/deployments', file)).isDirectory(),
	);
for (const network of networks) {
	const files = fs.readdirSync(path.resolve(__dirname, '../src/deployments', network));

	for (const file of files) {
		const filePath = path.resolve(__dirname, '../src/deployments', network, file);
		if (filePath.endsWith('json')) {
			console.log(filePath);
			const content = fs.readFileSync(filePath, 'utf8');
			fs.writeFileSync(filePath.replace(/[.]json/, '.ts'), `export default ${content}`);
			fs.rmSync(filePath);
		}
	}
}
