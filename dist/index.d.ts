export type TransitionState =
  | 'preEnter'
  | 'entering'
  | 'entered'
  | 'preExit'
  | 'exiting'
  | 'exited'
  | 'unmounted';

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

export const useTransition: (
  options?: TransitionOptions
) => [TransitionState, (toEnter?: boolean) => void, () => void];

interface State {
  state: TransitionState;
  isMounted: boolean;
  isEnter: boolean;
}

export interface TransitionMapOptions<K> extends Omit<TransitionOptions, 'onChange'> {
  onChange?: (event: { key: K } & State) => void;
}

export const useTransitionMap: <K>(options?: { singleEnter: boolean }) => {
  stateMap: Omit<Map<K, State>, 'clear' | 'delete' | 'set'>;
  toggle: (key: K, toEnter?: boolean) => void;
  endTransition: (key: K) => void;
  setItem: (key: K, options?: TransitionMapOptions<K>) => void;
  deleteItem: (key: K) => boolean;
};

export default useTransition;
