import { sveltekit } from '@sveltejs/kit/vite';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import path from 'path';
import nodeResolve from '@rollup/plugin-node-resolve';

const config = ({ mode }) => {
	const development = mode === 'development';

	/** @type {import('vite').UserConfig} */
	return {
		server: {
			hmr: {
				overlay: false,
			},
			watch: {
				usePolling: true,
				ignored: [
					'node_modules/**',
					'.git/**',
					'.firebase/**',
					'.husky/**',
					'.vscode/**',
					'docs/**',
					'functions/**',
					'scripts/**',
					'workers/**',
				],
			},
			fs: {
				strict: false,
			},
			force: false,
			preTransformRequests: false,
		},
		plugins: [
			sveltekit(),
			development &&
				nodePolyfills({
					include: ['node_modules/**/*.js', new RegExp('node_modules/.vite/.*js')],
					http: true,
					crypto: true,
				}),
		],
		test: {
			globals: true,
			environment: 'jsdom',
			include: ['src/**/*.{test,spec}.ts'],
			setupFiles: ['./setupTest.ts'],
			deps: {
				inline: ['@ethersproject/signing-key', '@ethersproject/basex'],
			},
		},
		resolve: {
			alias: {
				$stores: path.resolve('./src/stores'),
				$utils: path.resolve('./src/utils'),
				$assets: path.resolve('./src/assets'),
				$constants: path.resolve('./src/constants'),
				$models: path.resolve('./src/models'),
				$data: path.resolve('./src/data'),
				$services: path.resolve('./src/services'),
				crypto: 'crypto-browserify',
				stream: 'stream-browserify',
				assert: 'assert',
				'@coinbase/wallet-sdk': '@coinbase/wallet-sdk/dist/index.js',
				buffer: 'buffer/',
				util: 'util/',
			},
		},
		// Seems to be issues with bigint, I guess this will change shortly so depending on what happens
		// with this issue we'll be able to remove the next lines https://github.com/vitejs/vite/issues/9062

		optimizeDeps: {
			esbuildOptions: { target: 'es2020' },
			include: ['@web3-onboard/core'],
		},

		esbuild: {
			target: ['es2020'],
		},
		//

		ssr: {
			noExternal: ['@lingui/*', 'lingui-core/*'],
		},

		build: {
			target: ['es2020'],
			rollupOptions: {
				plugins: [
					nodePolyfills({
						crypto: true,
						http: true,
					}),
					nodeResolve(),
				],
				external: ['@web3-onboard/*'],
			},
			commonjsOptions: {
				transformMixedEsModules: true,
			},
		},
	};
};

export default config;
