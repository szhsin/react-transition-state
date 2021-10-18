'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

var PRE_ENTER = 0;
var ENTERING = 1;
var ENTERED = 2;
var PRE_EXIT = 3;
var EXITING = 4;
var EXITED = 5;
var UNMOUNTED = 6;
var STATES = ['preEnter', 'entering', 'entered', 'preExit', 'exiting', 'exited', 'unmounted'];

var startOrEnd = function startOrEnd(unmounted) {
  return unmounted ? UNMOUNTED : EXITED;
};

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

  var _useState = react.useState(initialEntered ? ENTERED : startOrEnd(mountOnEnter)),
      state = _useState[0],
      setState = _useState[1];

  var latestState = react.useRef(state);
  var timeoutId = react.useRef();
  var enterTimeout, exitTimeout;

  if (typeof timeout === 'object') {
    enterTimeout = timeout.enter;
    exitTimeout = timeout.exit;
  } else {
    enterTimeout = exitTimeout = timeout;
  }

  var endTransition = react.useCallback(function () {
    var newState;

    switch (latestState.current) {
      case ENTERING:
      case PRE_ENTER:
        newState = ENTERED;
        break;

      case EXITING:
      case PRE_EXIT:
        newState = startOrEnd(unmountOnExit);
        break;
    }

    if (newState !== undefined) {
      updateState(newState, setState, latestState, timeoutId, onChange);
    }
  }, [onChange, unmountOnExit]);
  var toggle = react.useCallback(function (toEnter) {
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
  react.useEffect(function () {
    return function () {
      return clearTimeout(timeoutId.current);
    };
  }, []);
  return [STATES[state], toggle, endTransition];
};

exports['default'] = useTransition;
exports.useTransition = useTransition;
