import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import  terser  from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';


const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/main.js',
	output: {
	  sourcemap: true,
	  format: 'iife',
	  name: 'app',
	  file: 'public/build/bundle.js',
	  globals: {
		axios: 'axios',
		'$lib/App.svelte': 'App',
		'@sveltejs/kit': 'kit'
	  }
	},
	plugins: [
		svelte({
		  compilerOptions: {
			dev: !production,
		  },
		  emitCss: true
		}),
	  resolve({
		browser: true,
		dedupe: ['svelte']
	  }),
	  commonjs(),
	  !production && livereload('public'),
	  production && terser()
	],
	watch: {
	  clearScreen: false
	}
  };
  
  function serve() {
	let started = false;
  
	return {
	  writeBundle() {
		if (!started) {
		  started = true;
  
		  require('child_process').spawn('npm', ['run', 'start', '--', '--dev'], {
			stdio: ['ignore', 'inherit', 'inherit'],
			shell: true
		  });
		}
	  }
	};
  }
