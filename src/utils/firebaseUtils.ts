export const convertFirebaseArray = (firebaseArray: { [key: string]: any }): any[] => {
	const array = [];
	Object.keys(firebaseArray).forEach((key) => {
		if (firebaseArray[key] instanceof Object) {
			// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-use-before-define
			firebaseArray[key] = convertFirebaseModel(firebaseArray[key]);
		}
		array.push(firebaseArray[key]);
	});
	return array;
};

export const convertFirebaseModel = <T>(model: T): T => {
	Object.keys(model).forEach((key) => {
		if (model[key] instanceof Object) {
			// if array
			if ((model[key] as object)[0]) {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-argument
				model[key] = convertFirebaseArray(model[key]);
			} else {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				model[key] = convertFirebaseModel(model[key]);
			}
		}
	});
	return model;
};
