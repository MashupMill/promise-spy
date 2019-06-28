import PromiseSpy from './';

export default
class PromiseInterceptor<T> {
    private promise: Promise<T>;

    constructor(executor: (resolve: (value?: T | PromiseLike<T>) => void, reject: (reason?: any) => void) => void) {
        this.promise = PromiseSpy.addPromise(new PromiseSpy.OriginalPromise(executor));
    }

    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2> {
        return PromiseSpy.addPromise(this.promise).then(onfulfilled, onrejected);
    }

    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult> {
        return PromiseSpy.addPromise(this.promise).catch(onrejected);
    }

    finally(onfinally?: (() => void) | undefined | null): Promise<T> {
        return PromiseSpy.addPromise(this.promise).finally(onfinally);
    }

    static resolve<T>(value: T | PromiseLike<T>): Promise<T>{
        return PromiseSpy.addPromise(PromiseSpy.OriginalPromise.resolve(value));
    }

    static reject<T = never>(reason?: any): Promise<T>{
        return PromiseSpy.addPromise(PromiseSpy.OriginalPromise.reject(reason));
    }

    static all<TAll>(values: Iterable<TAll | PromiseLike<TAll>>): Promise<TAll[]> {
        return PromiseSpy.OriginalPromise.all(values);
    }

    static allSettled<TAll>(values: Iterable<TAll | PromiseLike<TAll>>): Promise<TAll[]> {
        // @ts-ignore
        return PromiseSpy.OriginalPromise.allSettled(values);
    }

    static race<T>(values: Iterable<T | PromiseLike<T>>): Promise<T> {
        // @ts-ignore
        return PromiseSpy.OriginalPromise.race(values);
    }
}
