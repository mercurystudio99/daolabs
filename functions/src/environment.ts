import { cleanEnv, str } from 'envalid';

// TWITTER
const TWITTER_API_URL = 'https://api.twitter.com';
const TWITTER_CONSUMER_KEY = '';
const TWITTER_CONSUMER_SECRET = '';
const TWITTER_CONSUMER_BEARER = '';
const TWITTER_REDIRECT_URL = 'https://move.xyz/twitter';
const TWITTER_COOKIE_NAME = 'oauth_token';

export const environment = cleanEnv(process.env, {
	TWITTER_API_URL: str({ default: TWITTER_API_URL }),
	TWITTER_CONSUMER_KEY: str({ default: TWITTER_CONSUMER_KEY }),
	TWITTER_CONSUMER_SECRET: str({ default: TWITTER_CONSUMER_SECRET }),
	TWITTER_CONSUMER_BEARER: str({ default: TWITTER_CONSUMER_BEARER }),
	TWITTER_REDIRECT_URL: str({ default: TWITTER_REDIRECT_URL }),
	TWITTER_COOKIE_NAME: str({ default: TWITTER_COOKIE_NAME }),
});
