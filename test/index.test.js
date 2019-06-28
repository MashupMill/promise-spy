import { expect } from 'chai';
import sinon from 'sinon'
import PromiseSpy from '../src/index';

describe('PromiseSpy', () => {
    beforeEach(() => {
        PromiseSpy.install();
    });
    afterEach(() => {
        PromiseSpy.uninstall();
    });

    describe('readme example', () => {
        function doSomethingAsyncThatIsInaccessible(cb) {
            new Promise(resolve => {
                cb();
                resolve();
            });
        }

        it('should do something', async () => {
            const callback = sinon.stub();
            doSomethingAsyncThatIsInaccessible(callback);

            await PromiseSpy.wait();

            expect(callback.calledOnce).to.equal(true);
        });
    });

    describe('wait', () => {
        it('should wait for the promise to be resolve', async () => {
            let resolved = false;
            new Promise(resolve => (resolved = true) && resolve());

            await PromiseSpy.wait();

            expect(resolved).to.equal(true);
        });
        it('should wait for promises created within a promise', async () => {
            let resolved = false;

            Promise.resolve().then(() => {
                new Promise(resolve => (resolved = true) && resolve());
            });

            await PromiseSpy.wait();

            expect(resolved).to.equal(true);
        });
        it('should wait for promises even if one fails', async () => {
            let resolved = false, rejected = false;

            const methodToTest = async () => {
                Promise.reject().catch(() => rejected = true);
                await new Promise(resolve => setTimeout(resolve, 100));
                new Promise(resolve => (resolved = true) && resolve());
            };

            methodToTest();


            await PromiseSpy.wait();

            expect(rejected).to.equal(true);
            expect(resolved).to.equal(true);
        });
    });
});
