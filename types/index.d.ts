export type TransitionState =
  | 'preEnter'
  | 'entering'
  | 'entered'
  | 'preExit'
  | 'exiting'
  | 'exited'
  | 'unmounted';

export interface State {
  state: TransitionState;
  isMounted: boolean;
  isEnter: boolean;
}

export interface TransitionOptions {
  initialEntered?: boolean;
  mountOnEnter?: boolean;
  unmountOnExit?: boolean;
  preEnter?: boolean;
  preExit?: boolean;
  enter?: boolean;
  exit?: boolean;
  timeout?: number | { enter?: number; exit?: number };
  onChange?: (event: { state: TransitionState }) => void;
}

export interface TransitionItemOptions<K> extends Omit<TransitionOptions, 'onChange'> {
  onChange?: (event: { key: K } & State) => void;
}

export interface TransitionMapOptions {
  singleEnter?: boolean;
}

export type TransitionResult = [TransitionState, (toEnter?: boolean) => void, () => void];

export interface TransitionMapResult<K> {
  stateMap: Omit<Map<K, State>, 'clear' | 'delete' | 'set'>;
  toggle: (key: K, toEnter?: boolean) => void;
  endTransition: (key: K) => void;
  setItem: (key: K, options?: TransitionItemOptions<K>) => void;
  deleteItem: (key: K) => boolean;
}

export const useTransition: (options?: TransitionOptions) => TransitionResult;

export const useTransitionMap: <K>(options?: TransitionMapOptions) => TransitionMapResult<K>;

export default useTransition;
