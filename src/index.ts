import PromiseInterceptor from './PromiseInterceptor';

const root = typeof window === 'undefined' ? global : window;
const _Promise = root.Promise;

let promises: Promise<any>[] = [];
let debug: boolean = false;
let paused: boolean = false;

export default class PromiseSpy {
    static OriginalPromise: PromiseConstructor = _Promise;

    static install(clear = true) {
        debugLog('installing promise-spy');
        clear && PromiseSpy.clear();
        root.Promise = PromiseInterceptor;
        paused = false;
    }

    static uninstall() {
        debugLog('uninstalling promise-spy');
        root.Promise = PromiseSpy.OriginalPromise;
    }

    static get installed(): boolean {
        return root.Promise == PromiseInterceptor;
    }

    static debug(value: boolean = true) {
        debug = value;
    }

    static clear() {
        promises = [];
    }

    static addPromise<T>(promise: Promise<T>): Promise<T> {
        if (paused && promises.indexOf(promise) < 0) {
            // when paused, we will add to the promises only if it already exists. this is to allow us to go over
            // the wait iteration again when an existing promise gets a `then`, `catch`, `finally` added to it
            return promise;
        } else if(!PromiseSpy.installed) {
            debugLog('promise-spy not installed ... not updating promises');
            return promise;
        }
        debug && debugAddPromise(promise);
        promises.push(promise);
        return promise
    }

    static get<T>(i: number | null = null): Promise<T> | Promise<T>[] {
        return i !== null ? promises[i] : promises;
    }

    static wait() {
        debugLog('waiting');
        // initiate pause ... which will prevent new promises from being added, but still allow updates to existing ones
        paused = true;
        return new PromiseSpy.OriginalPromise(resolve => setTimeout(() => {
            // paused = true;
            PromiseSpy.uninstall();
            resolve();
        }, 0))
        .then(() => {
            // wait for promises to finish
            debugLog('waiting for promises to finish', promises);
            let beforeCount = 0;
            return promiseWhile(
                promises,
                (promises: Promise<any>[]) => promises.length > beforeCount,
                (promises: Promise<any>[]) => {
                    debugLog('processing promises', promises.length);
                    beforeCount = promises.length;
                    return waitForPending(promises);
                }
            );
        }).then(() => {
            PromiseSpy.install();
            paused = false;
        });
    }
}

const debugLog = (...args: any[]) => {
    debug && console.log(...args);
};


const debugAddPromise = (promise: Promise<any>) => {
    if (!debug) return;

    const id = promises.length;
    console.trace(`adding promise ${id} to stack`);
    promise.then((result) => {
        console.trace(`fulfilled ${id}`);
        return result;
    }).catch((err) => {
        console.trace(`rejected ${id}`);
        throw err;
    });
};

const waitForPending = (promises: Promise<any>[]): Promise<any> => {
    const copyOfPromises = [ ...promises ];
    return PromiseSpy.OriginalPromise.all(copyOfPromises.map(promise => {
        return new PromiseSpy.OriginalPromise(resolve => {
            setTimeout(() => {
                debugLog('waiting for promise', promises.indexOf(promise), promise);
                promise.then((result) => {
                    debugLog('fulfill', promises.indexOf(promise), promise);
                    resolve(result);
                }).catch((err) => {
                    debugLog('reject', promises.indexOf(promise), promise);
                    resolve(err);
                });
            }, 0);
        });
    }))
    .then((promises) => new PromiseSpy.OriginalPromise(resolve => setTimeout(() => resolve(promises), 0)));
};

const promiseWhile = <D>(data: D, condition: (data: D) => boolean, action: (data: D) => Promise<D>) => {
    const whilst = (data: D): Promise<D> => (
        condition(data)
            ? action(data).then(whilst)
            : Promise.resolve(data)
    );
    return whilst(data);
};
