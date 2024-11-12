'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var react = require('react');

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

const updateState$1 = (status, setState, latestState, timeoutId, onChange) => {
  clearTimeout(timeoutId.current);
  const state = getState(status);
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
  const [state, setState] = react.useState(() => getState(initialEntered ? ENTERED : startOrEnd(mountOnEnter)));
  const latestState = react.useRef(state);
  const timeoutId = react.useRef();
  const [enterTimeout, exitTimeout] = getTimeout(timeout);
  const endTransition = react.useCallback(() => {
    const status = getEndStatus(latestState.current._s, unmountOnExit);
    status && updateState$1(status, setState, latestState, timeoutId, onChange);
  }, [onChange, unmountOnExit]);
  const toggle = react.useCallback(toEnter => {
    const transitState = status => {
      updateState$1(status, setState, latestState, timeoutId, onChange);
      switch (status) {
        case ENTERING:
          if (enterTimeout >= 0) timeoutId.current = setTimeout(endTransition, enterTimeout);
          break;
        case EXITING:
          if (exitTimeout >= 0) timeoutId.current = setTimeout(endTransition, exitTimeout);
          break;
        case PRE_ENTER:
        case PRE_EXIT:
          timeoutId.current = nextTick(transitState, status);
          break;
      }
    };
    const enterStage = latestState.current.isEnter;
    if (typeof toEnter !== 'boolean') toEnter = !enterStage;
    if (toEnter) {
      !enterStage && transitState(enter ? preEnter ? PRE_ENTER : ENTERING : ENTERED);
    } else {
      enterStage && transitState(exit ? preExit ? PRE_EXIT : EXITING : startOrEnd(unmountOnExit));
    }
  }, [endTransition, onChange, enter, exit, preEnter, preExit, enterTimeout, exitTimeout, unmountOnExit]);
  react.useEffect(() => () => clearTimeout(timeoutId.current), []);
  return [state, toggle, endTransition];
};

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
  const [stateMap, setStateMap] = react.useState(new Map());
  const latestStateMap = react.useRef(stateMap);
  const configMap = react.useRef(new Map());
  const [enterTimeout, exitTimeout] = getTimeout(timeout);
  const setItem = react.useCallback((key, config) => {
    const {
      initialEntered: _initialEntered = initialEntered
    } = config || {};
    const status = _initialEntered ? ENTERED : startOrEnd(mountOnEnter);
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
    const status = getEndStatus(stateObj._s, unmountOnExit);
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

exports.default = useTransitionState;
exports.useTransition = useTransitionState;
exports.useTransitionMap = useTransitionMap;
exports.useTransitionState = useTransitionState;
