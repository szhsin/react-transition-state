'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;

  var _s, _e;

  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

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

var updateState = function updateState(newState, setState, latestState, timeoutId) {
  clearTimeout(timeoutId.current);
  setState(newState);
  latestState.current = newState;
};

var useTransition = function useTransition() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      initialEntered = _ref.initialEntered,
      mountOnEnter = _ref.mountOnEnter,
      unmountOnExit = _ref.unmountOnExit,
      timeout = _ref.timeout,
      preEnter = _ref.preEnter,
      preExit = _ref.preExit,
      _ref$enter = _ref.enter,
      enter = _ref$enter === void 0 ? true : _ref$enter,
      _ref$exit = _ref.exit,
      exit = _ref$exit === void 0 ? true : _ref$exit;

  var _useState = react.useState(initialEntered ? ENTERED : startOrEnd(mountOnEnter)),
      _useState2 = _slicedToArray(_useState, 2),
      state = _useState2[0],
      setState = _useState2[1];

  var latestState = react.useRef(state);
  var timeoutId = react.useRef();
  var enterTimeout, exitTimeout;

  if (_typeof(timeout) === 'object') {
    enterTimeout = timeout.enter;
    exitTimeout = timeout.exit;
  } else {
    enterTimeout = exitTimeout = timeout;
  }

  var endTransition = react.useCallback(function () {
    var newState;

    switch (latestState.current) {
      case PRE_ENTER:
      case ENTERING:
        newState = ENTERED;
        break;

      case PRE_EXIT:
      case EXITING:
        newState = startOrEnd(unmountOnExit);
        break;
    }

    if (newState) {
      updateState(newState, setState, latestState, timeoutId);
    }
  }, [unmountOnExit]);
  var transitState = react.useCallback(function (newState) {
    updateState(newState, setState, latestState, timeoutId);

    switch (newState) {
      case PRE_ENTER:
      case PRE_EXIT:
        timeoutId.current = setTimeout(function () {
          return transitState(newState + 1);
        }, 0);
        break;

      case ENTERING:
        if (enterTimeout >= 0) timeoutId.current = setTimeout(endTransition, enterTimeout);
        break;

      case EXITING:
        if (exitTimeout >= 0) timeoutId.current = setTimeout(endTransition, exitTimeout);
        break;
    }
  }, [enterTimeout, exitTimeout, endTransition]);
  var toggle = react.useCallback(function (toEnter) {
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
  }, [enter, exit, preEnter, preExit, unmountOnExit, transitState]);
  react.useEffect(function () {
    return function () {
      return clearTimeout(timeoutId.current);
    };
  }, []);
  return [STATES[state], toggle, endTransition];
};

exports.useTransition = useTransition;
