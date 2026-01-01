import type { TransitionOptions, TransitionState } from './types';

export const PRE_ENTER = 0;
export const ENTERING = 1;
export const ENTERED = 2;
export const PRE_EXIT = 3;
export const EXITING = 4;
export const EXITED = 5;
export const UNMOUNTED = 6;

/** @internal [INTERNAL ONLY – DO NOT USE] */
export type Status =
  | typeof PRE_ENTER
  | typeof ENTERING
  | typeof ENTERED
  | typeof PRE_EXIT
  | typeof EXITING
  | typeof EXITED
  | typeof UNMOUNTED;

/** @internal [INTERNAL ONLY – DO NOT USE] */
export type State = { _s: Status } & TransitionState;

export const STATUS = [
  'preEnter',
  'entering',
  'entered',
  'preExit',
  'exiting',
  'exited',
  'unmounted'
] as const;

export const getState = (status: Status): State => ({
  _s: status,
  status: STATUS[status],
  isEnter: status < PRE_EXIT,
  isMounted: status !== UNMOUNTED,
  isResolved: status === ENTERED || status > EXITING
});

export const startOrEnd = (unmounted: boolean | undefined) => (unmounted ? UNMOUNTED : EXITED);

export const getEndStatus = (status: Status, unmountOnExit: boolean | undefined) => {
  switch (status) {
    case ENTERING:
    case PRE_ENTER:
      return ENTERED;

    case EXITING:
    case PRE_EXIT:
      return startOrEnd(unmountOnExit);
  }
};

export const getTimeout = (timeout: TransitionOptions['timeout']) =>
  typeof timeout === 'object' ? [timeout.enter, timeout.exit] : [timeout, timeout];

const _setTimeout = setTimeout as typeof window.setTimeout;
export { _setTimeout as setTimeout };

export const nextTick = (transitState: (status: Status) => void, status: Status) =>
  _setTimeout(() => {
    // Reading document.body.offsetTop can force browser to repaint before transition to the next state
    isNaN(document.body.offsetTop) || transitState((status + 1) as Status);
  }, 0);
