import { toSentenceCase } from '$utils/string';

export const getErrorList = (model: { [key: string]: any }, overrides?: { [key: string]: any }) => {
	const errors: { field: string; message: string }[] = [];
	const getErrorsFromObject = (obj: { [key: string]: any }, fieldName = '') => {
		for (const attr in obj) {
			if (obj[attr] instanceof Array) {
				const arr = obj[attr] as Array<any>;
				arr.forEach((arrayObj: { [key: string]: any }, index: number) => {
					getErrorsFromObject(
						arrayObj,
						`${toSentenceCase(attr)}${arr.length > 1 ? `-${index + 1}` : ''}: `,
					);
				});
				continue;
			}
			if (obj[attr] instanceof Object) {
				getErrorsFromObject(obj[attr] as { [key: string]: any }, fieldName);
				continue;
			}
			if (obj[attr]) {
				const name =
					overrides && overrides[attr] ? (overrides[attr] as string) : toSentenceCase(attr);
				errors.push({ field: fieldName + name, message: obj[attr] as string });
			}
		}
	};
	getErrorsFromObject(model);
	return errors;
};
