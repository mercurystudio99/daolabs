import { Response } from 'express';
import { IPinFiles, IPinFilesBody, pinFiles } from '../../../src/routes/pinning/pinning';
import { TypedRequest } from '../../../src/types/TypedRequest';

const apikey = 'test-api-key';

describe('Pinning', () => {
	let mockRequest: Partial<TypedRequest<IPinFilesBody, IPinFiles[]>>;
    let mockResponse: Partial<Response>;
	
	beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn()
        };
    });

	it('should be success if json file are upload', async () => {
		const expectedResponse = {
			"success": true,
			"IpfsHash": "test-cid",
    		"Timestamp": Math.floor(Date.now() / 1000),
			"PinSize": 1
		};
		mockRequest = {
            headers: {
				apikey,
				'content-type': 'application/json'
            },
			body: {
				content: '{"test": "test"}',
				filename: 'test.json'
			}
        };
		await pinFiles(mockRequest as TypedRequest<IPinFilesBody, IPinFiles[]>, mockResponse as Response);
		expect(mockResponse.json).toBeCalledWith(expectedResponse);
	});

	it('should be success if one file are upload', async () => {
		const expectedResponse = {
			"success": true,
			"IpfsHash": "test-cid",
			"Timestamp": Math.floor(Date.now() / 1000),
			"PinSize": 1
		};
		mockRequest = {
            headers: {
				apikey,
				'content-type': 'multipart/form-data'
            },
			files: [
				{
					buffer: Buffer.from('{"test": "test"}')
				}
			]
        };
		await pinFiles(mockRequest as TypedRequest<IPinFilesBody, IPinFiles[]>, mockResponse as Response);
		expect(mockResponse.json).toBeCalledWith(expectedResponse);
	});

	it('should be success if multiple files are upload', async () => {
		const expectedResponse = {
			"success": true,
			"IpfsHash": "test-cid",
			"Timestamp": Math.floor(Date.now() / 1000),
			"PinSize": 3
		};
		mockRequest = {
            headers: {
				apikey,
				'content-type': 'multipart/form-data'
            },
			files: [
				{
					buffer: Buffer.from('{"test": "test"}')
				},
				{
					buffer: Buffer.from('{"test": "test1"}')
				},
				{
					buffer: Buffer.from('{"test": "test2"}')
				}
			]
        };
		await pinFiles(mockRequest as TypedRequest<IPinFilesBody, IPinFiles[]>, mockResponse as Response);
		expect(mockResponse.json).toBeCalledWith(expectedResponse);
	});

	it('should be an error if body and files is empty', async () => {
		const expectedResponse = {
			"success": false,
			"error": "No content"
		};
		mockRequest = {
            headers: {
				apikey,
				'content-type': 'multipart/form-data'
            }
        };
		await pinFiles(mockRequest as TypedRequest<IPinFilesBody, IPinFiles[]>, mockResponse as Response);
		expect(mockResponse.json).toBeCalledWith(expectedResponse);
	});
});
