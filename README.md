# sails-hook-vuewebpack

Sails.js hook that provides a Vue.js frontend using webpack.

## Install

```sh
npm install sails-hook-vuewebpack --save
```

## Getting started

You have to create your Sails project and disable the grunt hook in your `.sailsrc`
```
  "hooks": {
    "grunt": false
  }
```

Configure babel by copying the following lines in a new `.babelrc` file at the root of your project's folder
```
{
  "presets": ["es2015", "stage-2"],
  "plugins": ["transform-runtime"],
  "comments": false
}
```

Create a `src` folder where you'll place your `main.js` and `*.vue` source files, the index file `index.html` and your frontend assets directory `assets`.

Refer to the [Vue.js documentation](http://vuejs.org/guide/) for the content of these files.

## How it works

Upon initialization, the hook creates a fresh copy of `src/assets` in `.tmp/public/assets`, then compiles `src/main.js` (and its dependencies) into `.tmp/public/js/build/bundle.js` and finally links that bundle in `.tmp/public/index.html` by replacing the `<!-- #scripts -->` / `<!-- #end -->` tags from `src/index.html` with the proper markup to include the compiled script.

When lifted, Sails will serve the content of `.tmp/public` on the standard port, which corresponds to your frontend index file.

In development mode, the hook serves a dynamic copy of the bundle using [webpack-dev-server](https://webpack.github.io/docs/webpack-dev-server.html) on port `3000`. This provides Hot Module Replacement (HMR) functionality, i.e. changes in source files are reflected automatically in the browser without the need to refresh the page.

In production mode, the bundle is served from the compiled static file `.tmp/public/js/build/bundle.js`.
