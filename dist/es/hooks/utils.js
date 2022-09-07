var PRE_ENTER = 0;
var ENTERING = 1;
var ENTERED = 2;
var PRE_EXIT = 3;
var EXITING = 4;
var EXITED = 5;
var UNMOUNTED = 6;
var STATUS = ['preEnter', 'entering', 'entered', 'preExit', 'exiting', 'exited', 'unmounted'];
var getState = function getState(status) {
  return {
    _status: status,
    status: STATUS[status],
    isEnter: status < PRE_EXIT,
    isMounted: status !== UNMOUNTED,
    isResolved: status === ENTERED || status > EXITING
  };
};
var startOrEnd = function startOrEnd(unmounted) {
  return unmounted ? UNMOUNTED : EXITED;
};
var getEndStatus = function getEndStatus(status, unmountOnExit) {
  switch (status) {
    case ENTERING:
    case PRE_ENTER:
      return ENTERED;

    case EXITING:
    case PRE_EXIT:
      return startOrEnd(unmountOnExit);
  }
};
var getTimeout = function getTimeout(timeout) {
  return typeof timeout === 'object' ? [timeout.enter, timeout.exit] : [timeout, timeout];
};

export { ENTERED, ENTERING, EXITED, EXITING, PRE_ENTER, PRE_EXIT, STATUS, UNMOUNTED, getEndStatus, getState, getTimeout, startOrEnd };
