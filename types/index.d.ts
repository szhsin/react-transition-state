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

export default useTransition;
