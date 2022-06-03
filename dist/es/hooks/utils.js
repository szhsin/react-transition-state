var PRE_ENTER = 0;
var ENTERING = 1;
var ENTERED = 2;
var PRE_EXIT = 3;
var EXITING = 4;
var EXITED = 5;
var UNMOUNTED = 6;
var STATES = ['preEnter', 'entering', 'entered', 'preExit', 'exiting', 'exited', 'unmounted'];
var getFullState = function getFullState(_state) {
  return {
    _state: _state,
    state: STATES[_state],
    isEnter: _state < PRE_EXIT,
    isMounted: _state !== UNMOUNTED
  };
};
var startOrEnd = function startOrEnd(unmounted) {
  return unmounted ? UNMOUNTED : EXITED;
};
var getEndState = function getEndState(state, unmountOnExit) {
  switch (state) {
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

export { ENTERED, ENTERING, EXITED, EXITING, PRE_ENTER, PRE_EXIT, STATES, UNMOUNTED, getEndState, getFullState, getTimeout, startOrEnd };
