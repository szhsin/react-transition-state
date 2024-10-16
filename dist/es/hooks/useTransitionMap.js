import { useState, useRef, useCallback } from 'react';
import { getTimeout, getEndStatus, PRE_EXIT, nextTick, PRE_ENTER, EXITING, ENTERING, ENTERED, startOrEnd, getState } from './utils.js';

const updateState = (key, status, setStateMap, latestStateMap, timeoutId, onChange) => {
  clearTimeout(timeoutId);
  const state = getState(status);
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
  const [stateMap, setStateMap] = useState(new Map());
  const latestStateMap = useRef(stateMap);
  const configMap = useRef(new Map());
  const [enterTimeout, exitTimeout] = getTimeout(timeout);
  const setItem = useCallback((key, config) => {
    const {
      initialEntered: _initialEntered = initialEntered
    } = config || {};
    const status = _initialEntered ? ENTERED : startOrEnd(mountOnEnter);
    updateState(key, status, setStateMap, latestStateMap);
    configMap.current.set(key, {});
  }, [initialEntered, mountOnEnter]);
  const deleteItem = useCallback(key => {
    const newStateMap = new Map(latestStateMap.current);
    if (newStateMap.delete(key)) {
      setStateMap(newStateMap);
      latestStateMap.current = newStateMap;
      configMap.current.delete(key);
      return true;
    }
    return false;
  }, []);
  const endTransition = useCallback(key => {
    const stateObj = latestStateMap.current.get(key);
    if (!stateObj) {
      process.env.NODE_ENV !== 'production' && console.error(`[React-Transition-State] invalid key: ${key}`);
      return;
    }
    const {
      timeoutId
    } = configMap.current.get(key);
    const status = getEndStatus(stateObj._s, unmountOnExit);
    status && updateState(key, status, setStateMap, latestStateMap, timeoutId, onChange);
  }, [onChange, unmountOnExit]);
  const toggle = useCallback((key, toEnter) => {
    const stateObj = latestStateMap.current.get(key);
    if (!stateObj) {
      process.env.NODE_ENV !== 'production' && console.error(`[React-Transition-State] invalid key: ${key}`);
      return;
    }
    const config = configMap.current.get(key);
    const transitState = status => {
      updateState(key, status, setStateMap, latestStateMap, config.timeoutId, onChange);
      switch (status) {
        case ENTERING:
          if (enterTimeout >= 0) config.timeoutId = setTimeout(() => endTransition(key), enterTimeout);
          break;
        case EXITING:
          if (exitTimeout >= 0) config.timeoutId = setTimeout(() => endTransition(key), exitTimeout);
          break;
        case PRE_ENTER:
        case PRE_EXIT:
          config.timeoutId = nextTick(transitState, status);
          break;
      }
    };
    const enterStage = stateObj.isEnter;
    if (typeof toEnter !== 'boolean') toEnter = !enterStage;
    if (toEnter) {
      if (!enterStage) {
        transitState(enter ? preEnter ? PRE_ENTER : ENTERING : ENTERED);
        !allowMultiple && latestStateMap.current.forEach((_, _key) => _key !== key && toggle(_key, false));
      }
    } else {
      if (enterStage) {
        transitState(exit ? preExit ? PRE_EXIT : EXITING : startOrEnd(unmountOnExit));
      }
    }
  }, [onChange, endTransition, allowMultiple, enter, exit, preEnter, preExit, enterTimeout, exitTimeout, unmountOnExit]);
  const toggleAll = useCallback(toEnter => {
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

export { useTransitionMap };
