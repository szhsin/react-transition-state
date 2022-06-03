export const PRE_ENTER = 0;
export const ENTERING = 1;
export const ENTERED = 2;
export const PRE_EXIT = 3;
export const EXITING = 4;
export const EXITED = 5;
export const UNMOUNTED = 6;

export const STATES = [
  'preEnter',
  'entering',
  'entered',
  'preExit',
  'exiting',
  'exited',
  'unmounted'
];

export const getFullState = (_state) => ({
  _state,
  state: STATES[_state],
  isEnter: _state < PRE_EXIT,
  isMounted: _state !== UNMOUNTED
});

export const startOrEnd = (unmounted) => (unmounted ? UNMOUNTED : EXITED);

export const getEndState = (state, unmountOnExit) => {
  switch (state) {
    case ENTERING:
    case PRE_ENTER:
      return ENTERED;

    case EXITING:
    case PRE_EXIT:
      return startOrEnd(unmountOnExit);
  }
};

export const getTimeout = (timeout) =>
  typeof timeout === 'object' ? [timeout.enter, timeout.exit] : [timeout, timeout];
