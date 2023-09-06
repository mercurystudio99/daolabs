import { Response, Request } from 'express';
import { ipfsGateway } from '../../../src/routes/gateway/index';

describe('Gateway', () => {
	let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
	
	beforeEach(() => {
        mockRequest = {};
        mockResponse = {
			set: jest.fn(),
			send: jest.fn()
        };
    });

	it('should be return content if file exists', async () => {
		const expectedResponse = Buffer.from('test');		
		await ipfsGateway(mockRequest as Request, mockResponse as Response);
		expect(mockResponse.send).toBeCalledWith(expectedResponse);
	});
});
