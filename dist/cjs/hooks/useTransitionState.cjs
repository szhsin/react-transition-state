'use strict';

var react = require('react');
var utils = require('./utils.cjs');

const updateState = (status, setState, latestState, timeoutId, onChange) => {
  clearTimeout(timeoutId.current);
  const state = utils.getState(status);
  setState(state);
  latestState.current = state;
  onChange && onChange({
    current: state
  });
};
const useTransitionState = ({
  enter = true,
  exit = true,
  preEnter,
  preExit,
  timeout,
  initialEntered,
  mountOnEnter,
  unmountOnExit,
  onStateChange: onChange
} = {}) => {
  const [state, setState] = react.useState(() => utils.getState(initialEntered ? utils.ENTERED : utils.startOrEnd(mountOnEnter)));
  const latestState = react.useRef(state);
  const timeoutId = react.useRef();
  const [enterTimeout, exitTimeout] = utils.getTimeout(timeout);
  const endTransition = react.useCallback(() => {
    const status = utils.getEndStatus(latestState.current._s, unmountOnExit);
    status && updateState(status, setState, latestState, timeoutId, onChange);
  }, [onChange, unmountOnExit]);
  const toggle = react.useCallback(toEnter => {
    const transitState = status => {
      updateState(status, setState, latestState, timeoutId, onChange);
      switch (status) {
        case utils.ENTERING:
          if (enterTimeout >= 0) timeoutId.current = setTimeout(endTransition, enterTimeout);
          break;
        case utils.EXITING:
          if (exitTimeout >= 0) timeoutId.current = setTimeout(endTransition, exitTimeout);
          break;
        case utils.PRE_ENTER:
        case utils.PRE_EXIT:
          timeoutId.current = utils.nextTick(transitState, status);
          break;
      }
    };
    const enterStage = latestState.current.isEnter;
    if (typeof toEnter !== 'boolean') toEnter = !enterStage;
    if (toEnter) {
      !enterStage && transitState(enter ? preEnter ? utils.PRE_ENTER : utils.ENTERING : utils.ENTERED);
    } else {
      enterStage && transitState(exit ? preExit ? utils.PRE_EXIT : utils.EXITING : utils.startOrEnd(unmountOnExit));
    }
  }, [endTransition, onChange, enter, exit, preEnter, preExit, enterTimeout, exitTimeout, unmountOnExit]);
  return [state, toggle, endTransition];
};

exports.useTransitionState = useTransitionState;
