'use strict';

var react = require('react');
var utils = require('./utils.cjs');

const updateState = (key, status, setStateMap, latestStateMap, timeoutId, onChange) => {
  clearTimeout(timeoutId);
  const state = utils.getState(status);
  const stateMap = new Map(latestStateMap.current);
  stateMap.set(key, state);
  setStateMap(stateMap);
  latestStateMap.current = stateMap;
  onChange && onChange({
    key,
    current: state
  });
};
const useTransitionMap = ({
  allowMultiple,
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
  const [stateMap, setStateMap] = react.useState(new Map());
  const latestStateMap = react.useRef(stateMap);
  const configMap = react.useRef(new Map());
  const [enterTimeout, exitTimeout] = utils.getTimeout(timeout);
  const setItem = react.useCallback((key, config) => {
    const {
      initialEntered: _initialEntered = initialEntered
    } = config || {};
    const status = _initialEntered ? utils.ENTERED : utils.startOrEnd(mountOnEnter);
    updateState(key, status, setStateMap, latestStateMap);
    configMap.current.set(key, {});
  }, [initialEntered, mountOnEnter]);
  const deleteItem = react.useCallback(key => {
    const newStateMap = new Map(latestStateMap.current);
    if (newStateMap.delete(key)) {
      setStateMap(newStateMap);
      latestStateMap.current = newStateMap;
      configMap.current.delete(key);
      return true;
    }
    return false;
  }, []);
  const endTransition = react.useCallback(key => {
    const stateObj = latestStateMap.current.get(key);
    if (!stateObj) {
      process.env.NODE_ENV !== 'production' && console.error(`[React-Transition-State] invalid key: ${key}`);
      return;
    }
    const {
      timeoutId
    } = configMap.current.get(key);
    const status = utils.getEndStatus(stateObj._s, unmountOnExit);
    status && updateState(key, status, setStateMap, latestStateMap, timeoutId, onChange);
  }, [onChange, unmountOnExit]);
  const toggle = react.useCallback((key, toEnter) => {
    const stateObj = latestStateMap.current.get(key);
    if (!stateObj) {
      process.env.NODE_ENV !== 'production' && console.error(`[React-Transition-State] invalid key: ${key}`);
      return;
    }
    const config = configMap.current.get(key);
    const transitState = status => {
      updateState(key, status, setStateMap, latestStateMap, config.timeoutId, onChange);
      switch (status) {
        case utils.ENTERING:
          if (enterTimeout >= 0) config.timeoutId = setTimeout(() => endTransition(key), enterTimeout);
          break;
        case utils.EXITING:
          if (exitTimeout >= 0) config.timeoutId = setTimeout(() => endTransition(key), exitTimeout);
          break;
        case utils.PRE_ENTER:
        case utils.PRE_EXIT:
          config.timeoutId = utils.nextTick(transitState, status);
          break;
      }
    };
    const enterStage = stateObj.isEnter;
    if (typeof toEnter !== 'boolean') toEnter = !enterStage;
    if (toEnter) {
      if (!enterStage) {
        transitState(enter ? preEnter ? utils.PRE_ENTER : utils.ENTERING : utils.ENTERED);
        !allowMultiple && latestStateMap.current.forEach((_, _key) => _key !== key && toggle(_key, false));
      }
    } else {
      if (enterStage) {
        transitState(exit ? preExit ? utils.PRE_EXIT : utils.EXITING : utils.startOrEnd(unmountOnExit));
      }
    }
  }, [onChange, endTransition, allowMultiple, enter, exit, preEnter, preExit, enterTimeout, exitTimeout, unmountOnExit]);
  const toggleAll = react.useCallback(toEnter => {
    if (!allowMultiple && toEnter !== false) return;
    for (const key of latestStateMap.current.keys()) toggle(key, toEnter);
  }, [allowMultiple, toggle]);
  return {
    stateMap,
    toggle,
    toggleAll,
    endTransition,
    setItem,
    deleteItem
  };
};

exports.useTransitionMap = useTransitionMap;
