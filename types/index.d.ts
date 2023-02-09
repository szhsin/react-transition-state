export type TransitionStatus =
  | 'preEnter'
  | 'entering'
  | 'entered'
  | 'preExit'
  | 'exiting'
  | 'exited'
  | 'unmounted';

export type TransitionState = Readonly<{
  status: TransitionStatus;
  isMounted: boolean;
  isEnter: boolean;
  isResolved: boolean;
}>;

export interface TransitionOptions {
  initialEntered?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  preEnter?: boolean;
  preExit?: boolean;
  enter?: boolean;
  exit?: boolean;
  timeout?: number | { enter?: number; exit?: number };
  onStateChange?: (event: { current: TransitionState }) => void;
}

export interface TransitionItemOptions {
  initialEntered?: boolean;
}

export interface TransitionMapOptions<K> extends Omit<TransitionOptions, 'onStateChange'> {
  allowMultiple?: boolean;
  onStateChange?: (event: { key: K; current: TransitionState }) => void;
}

export type TransitionResult = [TransitionState, (toEnter?: boolean) => void, () => void];

export interface TransitionMapResult<K> {
  stateMap: ReadonlyMap<K, TransitionState>;
  toggle: (key: K, toEnter?: boolean) => void;
  toggleAll: (toEnter?: boolean) => void;
  endTransition: (key: K) => void;
  setItem: (key: K, options?: TransitionItemOptions) => void;
  deleteItem: (key: K) => boolean;
}

export const useTransition: (options?: TransitionOptions) => TransitionResult;

export const useTransitionMap: <K>(options?: TransitionMapOptions<K>) => TransitionMapResult<K>;

export default useTransition;
