import { useState, useRef, useCallback } from 'react';
import { getTimeout, ENTERED, startOrEnd, getEndStatus, PRE_EXIT, EXITING, PRE_ENTER, ENTERING, getState } from './utils.js';

var initialStateMap = new Map();
var initialConfigMap = new Map();

var updateState = function updateState(_ref) {
  var key = _ref.key,
      status = _ref.status,
      setStateMap = _ref.setStateMap,
      latestStateMap = _ref.latestStateMap,
      timeoutId = _ref.timeoutId,
      onChange = _ref.onChange;
  clearTimeout(timeoutId);
  var state = getState(status);
  var stateMap = new Map(latestStateMap.current);
  stateMap.set(key, state);
  setStateMap(stateMap);
  latestStateMap.current = stateMap;
  onChange && onChange({
    key: key,
    current: state
  });
};

var useTransitionMap = function useTransitionMap(_temp) {
  var _ref2 = _temp === void 0 ? {} : _temp,
      singleEnter = _ref2.singleEnter,
      _ref2$enter = _ref2.enter,
      enter = _ref2$enter === void 0 ? true : _ref2$enter,
      _ref2$exit = _ref2.exit,
      exit = _ref2$exit === void 0 ? true : _ref2$exit,
      preEnter = _ref2.preEnter,
      preExit = _ref2.preExit,
      timeout = _ref2.timeout,
      initialEntered = _ref2.initialEntered,
      mountOnEnter = _ref2.mountOnEnter,
      unmountOnExit = _ref2.unmountOnExit,
      onChange = _ref2.onStateChange;

  var _useState = useState(initialStateMap),
      stateMap = _useState[0],
      setStateMap = _useState[1];

  var latestStateMap = useRef(stateMap);
  var configMap = useRef(initialConfigMap);

  var _getTimeout = getTimeout(timeout),
      enterTimeout = _getTimeout[0],
      exitTimeout = _getTimeout[1];

  var setItem = useCallback(function (key, config) {
    var _ref3 = config || {},
        _ref3$initialEntered = _ref3.initialEntered,
        _initialEntered = _ref3$initialEntered === void 0 ? initialEntered : _ref3$initialEntered;

    var status = _initialEntered ? ENTERED : startOrEnd(mountOnEnter);
    updateState({
      key: key,
      status: status,
      setStateMap: setStateMap,
      latestStateMap: latestStateMap
    });
    configMap.current.set(key, {});
  }, [initialEntered, mountOnEnter]);
  var deleteItem = useCallback(function (key) {
    var newStateMap = new Map(latestStateMap.current);

    if (newStateMap.delete(key)) {
      setStateMap(newStateMap);
      latestStateMap.current = newStateMap;
      configMap.current.delete(key);
      return true;
    }

    return false;
  }, []);
  var endTransition = useCallback(function (key) {
    var stateObj = latestStateMap.current.get(key);

    if (!stateObj) {
      process.env.NODE_ENV !== 'production' && console.error("[React-Transition-State] invalid key: " + key);
      return;
    }

    var _configMap$current$ge = configMap.current.get(key),
        timeoutId = _configMap$current$ge.timeoutId;

    var status = getEndStatus(stateObj._status, unmountOnExit);
    status && updateState({
      key: key,
      status: status,
      setStateMap: setStateMap,
      latestStateMap: latestStateMap,
      timeoutId: timeoutId,
      onChange: onChange
    });
  }, [onChange, unmountOnExit]);
  var toggle = useCallback(function (key, toEnter) {
    var stateObj = latestStateMap.current.get(key);

    if (!stateObj) {
      process.env.NODE_ENV !== 'production' && console.error("[React-Transition-State] invalid key: " + key);
      return;
    }

    var config = configMap.current.get(key);

    var transitState = function transitState(status) {
      updateState({
        key: key,
        status: status,
        setStateMap: setStateMap,
        latestStateMap: latestStateMap,
        timeoutId: config.timeoutId,
        onChange: onChange
      });

      switch (status) {
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
            return transitState(status + 1);
          }, 0);
          break;
      }
    };

    var enterStage = stateObj._status <= ENTERED;
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
  }, [onChange, endTransition, singleEnter, enter, exit, preEnter, preExit, enterTimeout, exitTimeout, unmountOnExit]);
  return {
    stateMap: stateMap,
    toggle: toggle,
    endTransition: endTransition,
    setItem: setItem,
    deleteItem: deleteItem
  };
};

export { useTransitionMap };
