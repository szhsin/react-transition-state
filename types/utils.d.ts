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
    _s: Status;
} & TransitionState;
export declare const STATUS: readonly ["preEnter", "entering", "entered", "preExit", "exiting", "exited", "unmounted"];
export declare const getState: (status: Status) => State;
export declare const startOrEnd: (unmounted: boolean | undefined) => 5 | 6;
export declare const getEndStatus: (status: Status, unmountOnExit: boolean | undefined) => 2 | 5 | 6 | undefined;
export declare const getTimeout: (timeout: TransitionOptions["timeout"]) => (number | undefined)[];
declare const _setTimeout: WindowOrWorkerGlobalScope['setTimeout'];
export { _setTimeout as setTimeout };
export declare const nextTick: (transitState: (status: Status) => void, status: Status) => number;
