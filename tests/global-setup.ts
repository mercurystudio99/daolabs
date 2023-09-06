import { deleteFolder } from './lib/utils/common.js';

function globalSetup() {
	deleteFolder(process.env.TEST_DATA_DIR);
}

export default globalSetup;
