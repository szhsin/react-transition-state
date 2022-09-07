import { useState, useRef, useCallback, useEffect } from 'react';
import { getState, ENTERED, startOrEnd, getTimeout, getEndStatus, PRE_EXIT, EXITING, PRE_ENTER, ENTERING } from './utils.js';

var updateState = function updateState(status, setState, latestState, timeoutId, onChange) {
  clearTimeout(timeoutId.current);
  var state = getState(status);
  setState(state);
  latestState.current = state;
  onChange && onChange({
    current: state
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
      onChange = _ref.onStateChange;

  var _useState = useState(function () {
    return getState(initialEntered ? ENTERED : startOrEnd(mountOnEnter));
  }),
      state = _useState[0],
      setState = _useState[1];

  var latestState = useRef(state);
  var timeoutId = useRef();

  var _getTimeout = getTimeout(timeout),
      enterTimeout = _getTimeout[0],
      exitTimeout = _getTimeout[1];

  var endTransition = useCallback(function () {
    var status = getEndStatus(latestState.current._status, unmountOnExit);
    status && updateState(status, setState, latestState, timeoutId, onChange);
  }, [onChange, unmountOnExit]);
  var toggle = useCallback(function (toEnter) {
    var transitState = function transitState(status) {
      updateState(status, setState, latestState, timeoutId, onChange);

      switch (status) {
        case ENTERING:
          if (enterTimeout >= 0) timeoutId.current = setTimeout(endTransition, enterTimeout);
          break;

        case EXITING:
          if (exitTimeout >= 0) timeoutId.current = setTimeout(endTransition, exitTimeout);
          break;

        case PRE_ENTER:
        case PRE_EXIT:
          timeoutId.current = setTimeout(function () {
            return transitState(status + 1);
          }, 0);
          break;
      }
    };

    var enterStage = latestState.current.isEnter;
    if (typeof toEnter !== 'boolean') toEnter = !enterStage;

    if (toEnter) {
      !enterStage && transitState(enter ? preEnter ? PRE_ENTER : ENTERING : ENTERED);
    } else {
      enterStage && transitState(exit ? preExit ? PRE_EXIT : EXITING : startOrEnd(unmountOnExit));
    }
  }, [endTransition, onChange, enter, exit, preEnter, preExit, enterTimeout, exitTimeout, unmountOnExit]);
  useEffect(function () {
    return function () {
      return clearTimeout(timeoutId.current);
    };
  }, []);
  return [state, toggle, endTransition];
};

export { useTransition };
