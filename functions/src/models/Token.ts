interface OAuthStore {
	[key: string]: string;
}

interface Token {
	[key: string]: OAuthStore;
}

export const tokens: Token = {};
