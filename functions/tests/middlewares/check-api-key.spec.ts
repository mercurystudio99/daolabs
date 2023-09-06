
import { NextFunction, Request, Response } from 'express';
import { checkApiKey } from '../../src/middlewares/checkApiKey';

describe('Check api key middlware', () => {
	let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let nextFunction: NextFunction = jest.fn();
	
	beforeEach(() => {
        mockRequest = {};
        mockResponse = {
            json: jest.fn()
        };
    });

	it('should be 403 error if without apikey', () => {
		const expectedResponse = {
            "error": "Missing Api key from the header"
        };
		checkApiKey(mockRequest as Request, mockResponse as Response, nextFunction);
		expect(mockResponse.json).toBeCalledWith(expectedResponse);
	});

	it('should be 403 error if not found api key', async () => {
		const expectedResponse = {
            "error": "Api key not found"
        };
		mockRequest = {
            headers: {
				apikey: 'any-key2'
            }
        };
		await checkApiKey(mockRequest as Request, mockResponse as Response, nextFunction);
		expect(mockResponse.json).toBeCalledWith(expectedResponse); 
	});

	it('should be called nextFunction if exist apikey', async () => {
		mockRequest = {
            headers: {
                apikey: 'test'
            }
        }
        await checkApiKey(mockRequest as Request, mockResponse as Response, nextFunction);
        expect(nextFunction).toBeCalledTimes(1);
	});
});
