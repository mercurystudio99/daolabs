// Today's date in the format of August 11, 2022
const today = new Date().toLocaleDateString('en-US', {
	month: 'long',
	day: 'numeric',
	year: 'numeric',
});

function removeDaysFromToday(days: number) {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date.toLocaleDateString('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	});
}

export const mockData = [
	{
		date: removeDaysFromToday(2),
		id: '87',
		img: '/images/orange_lady-od.png',
		bids: [
			{
				address: '0xf6b6f07862a02c85628b3a9688beae07fea9c863',
				wadAmount: '75000000000000000000',
				createdAt: Date.now(),
				txHash: '0x1234567890',
			},
			{
				address: '0x57a16a385e86cd215def121e6887d23be8080d37',
				wadAmount: '50000000000000000000',
				createdAt: Date.now() - 1000 * 60 * 60,
				txHash: '0x1234567890',
			},
			{
				address: '0x0a9d21231192cd3f23e69b01f3454bfb7acbfefc',
				wadAmount: '25029000000000000000',
				createdAt: Date.now() - 1000 * 60 * 60 * 7,
				txHash: '0x1234567890',
			},
		],
	},
	{
		date: removeDaysFromToday(1),
		id: '87',
		img: '/images/blueberry-ol.png',
		bids: [
			{
				address: '0xf6b6f07862a02c85628b3a9688beae07fea9c863',
				wadAmount: '75000000000000000000',
				createdAt: Date.now(),
				txHash: '0x1234567890',
			},
			{
				address: '0x57a16a385e86cd215def121e6887d23be8080d37',
				wadAmount: '50000000000000000000',
				createdAt: Date.now() - 1000 * 60 * 60,
				txHash: '0x1234567890',
			},
			{
				address: '0x0a9d21231192cd3f23e69b01f3454bfb7acbfefc',
				wadAmount: '25029000000000000000',
				createdAt: Date.now() - 1000 * 60 * 60 * 7,
				txHash: '0x1234567890',
			},
		],
	},
	{
		date: today,
		id: '88',
		img: '/images/banana-od.png',
		bids: [
			{
				address: '0xf6b6f07862a02c85628b3a9688beae07fea9c863',
				wadAmount: '75000000000000000000',
				createdAt: Date.now(),
				txHash: '0x1234567890',
			},
			{
				address: '0x57a16a385e86cd215def121e6887d23be8080d37',
				wadAmount: '50000000000000000000',
				createdAt: Date.now() - 1000 * 60 * 60,
				txHash: '0x1234567890',
			},
			{
				address: '0x0a9d21231192cd3f23e69b01f3454bfb7acbfefc',
				wadAmount: '25029000000000000000',
				createdAt: Date.now() - 1000 * 60 * 60 * 7,
				txHash: '0x1234567890',
			},
		],
	},
];
