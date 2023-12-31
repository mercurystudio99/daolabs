// import { t } from '@lingui/macro';

class T {
	static _(arg0: string) {
		// TODO: sort out the translations
		return arg0;
	}
}

// Function to return {tokenSymbol} and/or 'tokens', translated and (possibly) capitalized
export const tokenSymbolText = ({
	tokenSymbol,
	capitalize,
	plural,
	includeTokenWord,
}: {
	tokenSymbol?: string;
	capitalize?: boolean;
	plural?: boolean;
	includeTokenWord?: boolean;
}) => {
	const tokenTextSingular = capitalize ? T._('Token') : T._('token');
	const tokenTextPlural = capitalize ? T._('Tokens') : T._('tokens');
	const tokenText = plural ? tokenTextPlural : tokenTextSingular;

	if (includeTokenWord) {
		return tokenSymbol ? `${tokenSymbol} ${tokenText}` : tokenText;
	}

	return tokenSymbol ?? tokenText;
};
