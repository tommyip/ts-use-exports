# ts-use-exports

A TypeScript custom transformer that redirects function reference to the
exports object.

When targeting CommonJS as the module target, the TypeScript compiler attach
all exported functions to the `module.exports` object. However, any reference
to those functions are not modified, causing unexpected results when one tries
to stub these functions in unit-tests. Consider this module:
```ts
/** foobar.ts */

export function foo() {
  return "foo";
}

export function bar() {
  return foo() + "bar";
}
```
which transpiles to:
```js
/** foobar.js */

function foo() {
  return "foo";
}
exports.foo = foo;
function bar() {
  return foo() + "bar";
}
exports.bar = bar;
```

Let's unit test this module. If `foo` is a function that triggers network activity
or some other operation that we do not wish to exercise, it is common to stub
it with a fake function.
```js
/** test_foobar.js */

assert.strictEqual(foobar.bar(), "foobar"); // Pass

// Use SinonJS to stub out the foo function
sinon.replace(foobar, 'foo', sinon.fake.returns("bar"));

assert.strictEqual(foobar.bar(), "barbar"); // AssertionError! Actual: foobar
```

Sinon works by overwriting the reference to a value on an object. The second
assert failed because the `foo()` call in `bar` is referencing the said
function directly rather than through the `module.exports` object. This package
provides a custom TypeScript transformer that emits the proper function call
(ie `exports.foo()`) so that function stubbing works as expected.


## Usage

First install the package
```sh
yarn add ts-use-exports
# or
npm install ts-use-exports
```

Depending on your toolchain, see one of the example setups below on using the
custom transformer.

### ts-node

ts-node by default does not provide a program instance to custom transformers.
We will use `ttypescript` (install with `yarn add ttypescript`) to work around
this limitation.

```json
// tsconfig.json
{
  "compilerOptions": {
    // ...
    "plugins": [
      { "transform": "ts-use-exports" }
    ]
  }
}
```
Then invoke the ts-node binary with the ttypescipt compiler
```
ts-node --compiler ttypescript
```

Alternatively, if you use ts-node programmatically,
```js
require('ts-node').register({
  project: 'tsconfig.json',
  compiler: 'ttypescript',
})
```

### Webpack (with ts-loader / awesome-typescript-loader)

```js
// webpack.config.js
const tsUseExports = require('ts-use-exports');

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: 'ts-loader', // or 'awesome-typescript-loader'
        options: {
          getCustomTransformers: program => ({
            before: [tsUseExports(program)],
          }),
        },
      },
    ],
  },
};
```

## Note

* The transformer currently can only detect exported function if it is declared
  with an export modifier. The transformer does not work if you use an export
  statment.
  ```ts
  function foo () { }
  export { foo };
  ```
* The module target must be CommonJS (either set explicity or implied by
  `ES3`/`ES5` target).
