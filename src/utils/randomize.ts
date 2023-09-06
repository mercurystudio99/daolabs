export function shuffleArray<T>(a: T[]): T[] {
	let currentIndex = a.length;
	let randomIndex: number;
	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[a[currentIndex], a[randomIndex]] = [a[randomIndex], a[currentIndex]];
	}
	return a;
}
