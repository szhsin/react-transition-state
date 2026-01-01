import type { TransitionOptions, TransitionResult } from './types';
export declare const useTransitionState: ({ enter, exit, preEnter, preExit, timeout, initialEntered, mountOnEnter, unmountOnExit, onStateChange: onChange }?: TransitionOptions) => TransitionResult;
