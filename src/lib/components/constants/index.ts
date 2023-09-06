import * as user from './userDefaults';
import * as legal from './legalDefaults';

const defaults = { ...user, ...legal };

export { defaults };
