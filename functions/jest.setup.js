
jest.setTimeout(11000)

jest.mock('firebase-admin', () => ({
		initializeApp: () => ({
			firestore: () => ({
				doc: (path) => ({
					get: () => ({
						exists: path.includes('test'), 
						data: () => ({ whitelisted: path.includes('test') })
					})
				})
			})
		}),
		storage: () => ({
			bucket: () => ({
				file: (cid) => {
					const { Readable } = require('stream');
					const readable = new Readable();
					readable.push("hello");
					readable.push("world");
					readable.push(null);
					const testCid = cid === 'test-cid';
					return {
						getMetadata: testCid ? () => ({}) : jest.fn(),
						save: jest.fn(),
						createReadStream: jest.fn().mockImplementation(() => readable),
						exists: jest.fn().mockImplementation(() => [true]),
						metadata: {
							contentType: 'application/json'
						},
						download: jest.fn().mockImplementation(() => [Buffer.from('test')]) 
					};
				}
			})
		}),
	firestore: jest.fn()
}));

jest.mock('nft.storage', () => ({
	NFTStorage: jest.fn().mockImplementation(() => ({
		storeBlob: jest.fn().mockImplementation(() => 'test-cid'),
		storeDirectory: jest.fn().mockImplementation(() => 'test-cid')
	})),
	toGatewayURL: jest.requireActual('nft.storage').toGatewayURL,
	File: jest.requireActual('nft.storage').File,
}));