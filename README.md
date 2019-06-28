[![npm](https://img.shields.io/npm/v/promise-spy.svg?style=for-the-badge)](https://www.npmjs.com/package/promise-spy)
[![npm](https://img.shields.io/npm/dm/promise-spy.svg?style=for-the-badge)](https://npmjs.org/package/promise-spy)
[![GitHub issues](https://img.shields.io/github/issues-raw/MashupMill/promise-spy.svg?style=for-the-badge)](https://github.com/MashupMill/promise-spy/issues)

[![Travis](https://img.shields.io/travis/MashupMill/promise-spy.svg?style=for-the-badge)](https://travis-ci.org/MashupMill/promise-spy)
[![David](https://img.shields.io/david/MashupMill/promise-spy.svg?style=for-the-badge)](https://david-dm.org/MashupMill/promise-spy)

# promise-spy
Sets up an interceptor for Promise's which so we can get them later statically

## Installation ... someday

```bash
npm install --save-dev promise-spy
```

## Usage

```jsx harmony
function doSomethingAsyncThatIsInaccessible(cb) {
    new Promise(resolve => {
        cb();
        resolve();
    });
}

describe('Some Test', () => {
    beforeEach(() => {
        PromiseSpy.install();
    });
    afterEach(() => {
        PromiseSpy.uninstall();
    });

    it('should do something', async () => {
        const callback = sinon.stub();
        doSomethingAsyncThatIsInaccessible(callback);

        await PromiseSpy.wait();

        expect(callback.calledOnce).to.equal(true);
    });
});
```
