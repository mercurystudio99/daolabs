const PRIMITIVE_POLYNOMIAL = 29;

const BIT_PADDING = 128;
const BIT_COUNT = 8;
const BIT_SIZE = 2 ** BIT_COUNT;

const BYTES_PER_CHARACTER = 2;
const MAX_BYTES_PER_CHARACTER = 6;

const MAX_SHARES = BIT_SIZE - 1;

const UTF8_ENCODING = 'utf8';
const BIN_ENCODING = 'binary';
const HEX_ENCODING = 'hex';

export {
	PRIMITIVE_POLYNOMIAL,
	BIT_PADDING,
	BIT_COUNT,
	BIT_SIZE,
	MAX_SHARES,
	MAX_BYTES_PER_CHARACTER,
	BYTES_PER_CHARACTER,
	UTF8_ENCODING,
	BIN_ENCODING,
	HEX_ENCODING,
};
