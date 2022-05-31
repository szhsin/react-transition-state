import { useState, useRef, useCallback, useEffect } from 'react';
import { ENTERED, startOrEnd, getTimeout, getEndState, PRE_EXIT, EXITING, STATES, PRE_ENTER, ENTERING } from './utils.js';

var updateState = function updateState(state, setState, latestState, timeoutId, onChange) {
  clearTimeout(timeoutId.current);
  setState(state);
  latestState.current = state;
  onChange && onChange({
    state: STATES[state]
  });
};

var useTransition = function useTransition(_temp) {
  var _ref = _temp === void 0 ? {} : _temp,
      _ref$enter = _ref.enter,
      enter = _ref$enter === void 0 ? true : _ref$enter,
      _ref$exit = _ref.exit,
      exit = _ref$exit === void 0 ? true : _ref$exit,
      preEnter = _ref.preEnter,
      preExit = _ref.preExit,
      timeout = _ref.timeout,
      initialEntered = _ref.initialEntered,
      mountOnEnter = _ref.mountOnEnter,
      unmountOnExit = _ref.unmountOnExit,
      onChange = _ref.onChange;

  var _useState = useState(initialEntered ? ENTERED : startOrEnd(mountOnEnter)),
      state = _useState[0],
      setState = _useState[1];

  var latestState = useRef(state);
  var timeoutId = useRef();

  var _getTimeout = getTimeout(timeout),
      enterTimeout = _getTimeout[0],
      exitTimeout = _getTimeout[1];

  var endTransition = useCallback(function () {
    var newState = getEndState(latestState.current, unmountOnExit);
    newState && updateState(newState, setState, latestState, timeoutId, onChange);
  }, [onChange, unmountOnExit]);
  var toggle = useCallback(function (toEnter) {
    var transitState = function transitState(newState) {
      updateState(newState, setState, latestState, timeoutId, onChange);

      switch (newState) {
        case ENTERING:
          if (enterTimeout >= 0) timeoutId.current = setTimeout(endTransition, enterTimeout);
          break;

        case EXITING:
          if (exitTimeout >= 0) timeoutId.current = setTimeout(endTransition, exitTimeout);
          break;

        case PRE_ENTER:
        case PRE_EXIT:
          timeoutId.current = setTimeout(function () {
            return transitState(newState + 1);
          }, 0);
          break;
      }
    };

    var enterStage = latestState.current <= ENTERED;
    if (typeof toEnter !== 'boolean') toEnter = !enterStage;

    if (toEnter) {
      if (!enterStage) {
        transitState(enter ? preEnter ? PRE_ENTER : ENTERING : ENTERED);
      }
    } else {
      if (enterStage) {
        transitState(exit ? preExit ? PRE_EXIT : EXITING : startOrEnd(unmountOnExit));
      }
    }
  }, [endTransition, onChange, enter, exit, preEnter, preExit, enterTimeout, exitTimeout, unmountOnExit]);
  useEffect(function () {
    return function () {
      return clearTimeout(timeoutId.current);
    };
  }, []);
  return [STATES[state], toggle, endTransition];
};

export { useTransition };
