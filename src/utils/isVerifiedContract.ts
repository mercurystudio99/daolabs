export const verifiedContracts = [
	'0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
];

export function isVerifiedContract(contractAddress: string) {
	return !!verifiedContracts.find(
		(contract) => contract.toLowerCase() === contractAddress.toLowerCase(),
	);
}
