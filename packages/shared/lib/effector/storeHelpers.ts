import { Store, combine } from 'effector';

export const combineStores = <T extends Record<string, Store<any>>>(stores: T) => combine(stores);

export const deriveStore = <T, R>(store: Store<T>, fn: (state: T) => R): Store<R> => store.map(fn);
