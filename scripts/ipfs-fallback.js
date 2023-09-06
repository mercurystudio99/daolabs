import fs from 'fs';

async function main() {
	try {
		fs.copyFileSync('build/404.html', 'build/ipfs-404.html');
	} catch (e) {
		console.error(e.message || e);
	}

	// try {
	// 	fs.copyFileSync('build/user.html', 'build/user/index.html');
	// 	// in build/user/index.html replace all instances of ./_app/ with ../_app/
	// 	const userIndex = fs.readFileSync('build/user/index.html', 'utf8');
	// 	fs.writeFileSync('build/user/index.html', userIndex.replace(/\.\/_app\//g, '../_app/'));
	// } catch (e) {
	// 	console.error(e.message || e);
	// }
}

main();
