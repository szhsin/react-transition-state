import type { TransitionMapOptions, TransitionMapResult } from './types';
declare const useTransitionMap: <TKey>({ allowMultiple, enter, exit, preEnter, preExit, timeout, initialEntered, mountOnEnter, unmountOnExit, onStateChange: onChange }?: TransitionMapOptions<TKey>) => TransitionMapResult<TKey>;
export { useTransitionMap };
