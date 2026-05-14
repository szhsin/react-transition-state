/**
 * ⚠️ WARNING: INTERNAL TYPES
 *
 * These types are INTERNAL and NOT intended for public use.
 * They may CHANGE WITHOUT NOTICE and do NOT follow semver rules.
 *
 * ❌ Do NOT extend or derive types from these.
 *
 * Single-character property names are used intentionally
 * to MINIMIZE bundle size and reduce internal overhead.
 */
import type { TransitionOptions, TransitionState } from './types';
export declare const PRE_ENTER = 0;
export declare const ENTERING = 1;
export declare const ENTERED = 2;
export declare const PRE_EXIT = 3;
export declare const EXITING = 4;
export declare const EXITED = 5;
export declare const UNMOUNTED = 6;
/** @internal [INTERNAL ONLY – DO NOT USE] */
export type Status = typeof PRE_ENTER | typeof ENTERING | typeof ENTERED | typeof PRE_EXIT | typeof EXITING | typeof EXITED | typeof UNMOUNTED;
/** @internal [INTERNAL ONLY – DO NOT USE] */
export type State = {
    /** @internal status code */
    $: Status;
} & TransitionState;
export interface Config {
    /** @internal setTimeout Id */
    t?: number;
    /** @internal requestAnimationFrame Id */
    r: number;
}
export interface TransitionStateRef extends Config {
    /** @internal the latest state */
    s: State;
}
export interface TransitionMapRef<TKey> {
    /** @internal the latest state map */
    m: Map<TKey, State>;
    /** @internal the config map */
    c: Map<TKey, Config>;
}
export type SetTimeout = WindowOrWorkerGlobalScope['setTimeout'];
export declare const STATUS: readonly ["preEnter", "entering", "entered", "preExit", "exiting", "exited", "unmounted"];
export declare const getState: (status: Status) => State;
export declare const startOrEnd: (unmounted: boolean | undefined) => 5 | 6;
export declare const getEndStatus: (status: Status, unmountOnExit: boolean | undefined) => 2 | 5 | 6 | undefined;
export declare const getTimeout: (timeout: TransitionOptions["timeout"]) => (number | undefined)[];
export declare const nextTick: (callback: () => void, config: Config) => void;
