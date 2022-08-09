export const PRE_ENTER = 0;
export const ENTERING = 1;
export const ENTERED = 2;
export const PRE_EXIT = 3;
export const EXITING = 4;
export const EXITED = 5;
export const UNMOUNTED = 6;

export const STATUS = [
  'preEnter',
  'entering',
  'entered',
  'preExit',
  'exiting',
  'exited',
  'unmounted'
];

export const getState = (_status) => ({
  _status,
  status: STATUS[_status],
  isEnter: _status < PRE_EXIT,
  isMounted: _status !== UNMOUNTED,
  isResolved: _status === ENTERED || _status > EXITING
});

export const startOrEnd = (unmounted) => (unmounted ? UNMOUNTED : EXITED);

export const getEndStatus = (status, unmountOnExit) => {
  switch (status) {
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
