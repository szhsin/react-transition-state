const PRE_ENTER = 0;
const ENTERING = 1;
const ENTERED = 2;
const PRE_EXIT = 3;
const EXITING = 4;
const EXITED = 5;
const UNMOUNTED = 6;
const STATUS = ['preEnter', 'entering', 'entered', 'preExit', 'exiting', 'exited', 'unmounted'];
const getState = status => ({
  _s: status,
  status: STATUS[status],
  isEnter: status < PRE_EXIT,
  isMounted: status !== UNMOUNTED,
  isResolved: status === ENTERED || status > EXITING
});
const startOrEnd = unmounted => unmounted ? UNMOUNTED : EXITED;
const getEndStatus = (status, unmountOnExit) => {
  switch (status) {
    case ENTERING:
    case PRE_ENTER:
      return ENTERED;
    case EXITING:
    case PRE_EXIT:
      return startOrEnd(unmountOnExit);
  }
};
const getTimeout = timeout => typeof timeout === 'object' ? [timeout.enter, timeout.exit] : [timeout, timeout];
const nextTick = (transitState, status) => setTimeout(() => {
  // Reading document.body.offsetTop can force browser to repaint before transition to the next state
  isNaN(document.body.offsetTop) || transitState(status + 1);
}, 0);

export { ENTERED, ENTERING, EXITED, EXITING, PRE_ENTER, PRE_EXIT, STATUS, UNMOUNTED, getEndStatus, getState, getTimeout, nextTick, startOrEnd };
