declare namespace Attributes {
	enum BoostType {
		number = 'boost_number',
		percentage = 'boost_percentage',
	}

	type Property = {
		label: string;
		value: string;
		rarity?: string;
	};

	type Numeric = {
		label: string;
		value: number;
	};

	type Boost = Numeric & {
		type: BoostType;
	};

	type Stat = Numeric & {
		max?: number;
	};

	type Ranking = Stat;
}
