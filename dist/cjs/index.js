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

var updateState$1 = function updateState(state, setState, latestState, timeoutId, onChange) {
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

  var _getTimeout = getTimeout(timeout),
      enterTimeout = _getTimeout[0],
      exitTimeout = _getTimeout[1];

  var endTransition = react.useCallback(function () {
    var newState = getEndState(latestState.current, unmountOnExit);
    newState && updateState$1(newState, setState, latestState, timeoutId, onChange);
  }, [onChange, unmountOnExit]);
  var toggle = react.useCallback(function (toEnter) {
    var transitState = function transitState(newState) {
      updateState$1(newState, setState, latestState, timeoutId, onChange);

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

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

var initialStateMap = new Map();
var initialConfigMap = new Map();

var updateState = function updateState(_ref) {
  var key = _ref.key,
      _state = _ref.newState,
      setStateMap = _ref.setStateMap,
      latestStateMap = _ref.latestStateMap,
      timeoutId = _ref.timeoutId,
      onChange = _ref.onChange;
  clearTimeout(timeoutId);
  var state = getFullState(_state);
  var stateMap = new Map(latestStateMap.current);
  stateMap.set(key, state);
  setStateMap(stateMap);
  latestStateMap.current = stateMap;
  onChange && onChange(_extends({
    key: key
  }, state));
};

var useTransitionMap = function useTransitionMap(_temp) {
  var _ref2 = _temp === void 0 ? {} : _temp,
      singleEnter = _ref2.singleEnter;

  var _useState = react.useState(initialStateMap),
      stateMap = _useState[0],
      setStateMap = _useState[1];

  var latestStateMap = react.useRef(stateMap);
  var configMap = react.useRef(initialConfigMap);
  var setItem = react.useCallback(function (key, config) {
    if (config === void 0) {
      config = {};
    }

    var _config = config,
        initialEntered = _config.initialEntered,
        mountOnEnter = _config.mountOnEnter;
    var newState = initialEntered ? ENTERED : startOrEnd(mountOnEnter);
    updateState({
      key: key,
      newState: newState,
      setStateMap: setStateMap,
      latestStateMap: latestStateMap
    });
    configMap.current.set(key, _extends({}, config));
  }, []);
  var deleteItem = react.useCallback(function (key) {
    var newStateMap = new Map(latestStateMap.current);

    if (newStateMap.delete(key)) {
      setStateMap(newStateMap);
      latestStateMap.current = newStateMap;
      configMap.current.delete(key);
      return true;
    }

    return false;
  }, []);
  var endTransition = react.useCallback(function (key) {
    var stateObj = latestStateMap.current.get(key);

    if (!stateObj) {
      process.env.NODE_ENV !== 'production' && console.error("[React-Transition-State] invalid key: " + key);
      return;
    }

    var _configMap$current$ge = configMap.current.get(key),
        timeoutId = _configMap$current$ge.timeoutId,
        onChange = _configMap$current$ge.onChange,
        unmountOnExit = _configMap$current$ge.unmountOnExit;

    var newState = getEndState(stateObj._state, unmountOnExit);
    newState && updateState({
      key: key,
      newState: newState,
      setStateMap: setStateMap,
      latestStateMap: latestStateMap,
      timeoutId: timeoutId,
      onChange: onChange
    });
  }, []);
  var toggle = react.useCallback(function (key, toEnter) {
    var stateObj = latestStateMap.current.get(key);

    if (!stateObj) {
      process.env.NODE_ENV !== 'production' && console.error("[React-Transition-State] invalid key: " + key);
      return;
    }

    var config = configMap.current.get(key);
    var _config$enter = config.enter,
        enter = _config$enter === void 0 ? true : _config$enter,
        _config$exit = config.exit,
        exit = _config$exit === void 0 ? true : _config$exit,
        preEnter = config.preEnter,
        preExit = config.preExit,
        timeout = config.timeout,
        unmountOnExit = config.unmountOnExit,
        onChange = config.onChange,
        timeoutId = config.timeoutId;

    var transitState = function transitState(newState) {
      updateState({
        key: key,
        newState: newState,
        setStateMap: setStateMap,
        latestStateMap: latestStateMap,
        timeoutId: timeoutId,
        onChange: onChange
      });

      var _getTimeout = getTimeout(timeout),
          enterTimeout = _getTimeout[0],
          exitTimeout = _getTimeout[1];

      switch (newState) {
        case ENTERING:
          if (enterTimeout >= 0) config.timeoutId = setTimeout(function () {
            return endTransition(key);
          }, enterTimeout);
          break;

        case EXITING:
          if (exitTimeout >= 0) config.timeoutId = setTimeout(function () {
            return endTransition(key);
          }, exitTimeout);
          break;

        case PRE_ENTER:
        case PRE_EXIT:
          config.timeoutId = setTimeout(function () {
            return transitState(newState + 1);
          }, 0);
          break;
      }
    };

    var enterStage = stateObj._state <= ENTERED;
    if (typeof toEnter !== 'boolean') toEnter = !enterStage;

    if (toEnter) {
      if (!enterStage) {
        transitState(enter ? preEnter ? PRE_ENTER : ENTERING : ENTERED);
        singleEnter && latestStateMap.current.forEach(function (_, _key) {
          return _key !== key && toggle(_key, false);
        });
      }
    } else {
      if (enterStage) {
        transitState(exit ? preExit ? PRE_EXIT : EXITING : startOrEnd(unmountOnExit));
      }
    }
  }, [endTransition, singleEnter]);
  return {
    stateMap: stateMap,
    toggle: toggle,
    endTransition: endTransition,
    setItem: setItem,
    deleteItem: deleteItem
  };
};

exports["default"] = useTransition;
exports.useTransition = useTransition;
exports.useTransitionMap = useTransitionMap;
