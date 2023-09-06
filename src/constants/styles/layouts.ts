import { padding } from './padding';
import type * as CSS from 'csstype';

interface ScreenBreakpoints {
	xs?: number;
	sm?: number;
	md?: number;
	lg?: number;
	xl?: number;
}

type Layout = CSS.Properties & ScreenBreakpoints;

export const layouts: Record<string, Layout> = {
	centered: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
	},
	maxWidth: {
		maxWidth: '1080px',
		margin: '0 auto',
		padding: padding.app,
	},
	screen: {
		xs: 400,
		sm: 640,
		md: 768,
		lg: 992,
		xl: 1200,
	},
};
