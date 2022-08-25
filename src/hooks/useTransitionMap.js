import { useRef, useState, useCallback } from 'react';
import {
  PRE_ENTER,
  ENTERING,
  ENTERED,
  PRE_EXIT,
  EXITING,
  startOrEnd,
  getState,
  getEndStatus,
  getTimeout
} from './utils';

const initialStateMap = new Map();
const initialConfigMap = new Map();

const updateState = ({ key, status, setStateMap, latestStateMap, timeoutId, onChange }) => {
  clearTimeout(timeoutId);
  const state = getState(status);
  const stateMap = new Map(latestStateMap.current);
  stateMap.set(key, state);
  setStateMap(stateMap);
  latestStateMap.current = stateMap;
  onChange && onChange({ key, current: state });
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
  const [stateMap, setStateMap] = useState(initialStateMap);
  const latestStateMap = useRef(stateMap);
  const configMap = useRef(initialConfigMap);
  const [enterTimeout, exitTimeout] = getTimeout(timeout);

  const setItem = useCallback(
    (key, config) => {
      const { initialEntered: _initialEntered = initialEntered } = config || {};
      const status = _initialEntered ? ENTERED : startOrEnd(mountOnEnter);
      updateState({ key, status, setStateMap, latestStateMap });
      configMap.current.set(key, {});
    },
    [initialEntered, mountOnEnter]
  );

  const deleteItem = useCallback((key) => {
    const newStateMap = new Map(latestStateMap.current);
    if (newStateMap.delete(key)) {
      setStateMap(newStateMap);
      latestStateMap.current = newStateMap;
      configMap.current.delete(key);
      return true;
    }
    return false;
  }, []);

  const endTransition = useCallback(
    (key) => {
      const stateObj = latestStateMap.current.get(key);
      if (!stateObj) {
        process.env.NODE_ENV !== 'production' &&
          console.error(`[React-Transition-State] invalid key: ${key}`);
        return;
      }

      const { timeoutId } = configMap.current.get(key);
      const status = getEndStatus(stateObj._status, unmountOnExit);
      status && updateState({ key, status, setStateMap, latestStateMap, timeoutId, onChange });
    },
    [onChange, unmountOnExit]
  );

  const toggle = useCallback(
    (key, toEnter) => {
      const stateObj = latestStateMap.current.get(key);
      if (!stateObj) {
        process.env.NODE_ENV !== 'production' &&
          console.error(`[React-Transition-State] invalid key: ${key}`);
        return;
      }

      const config = configMap.current.get(key);

      const transitState = (status) => {
        updateState({
          key,
          status,
          setStateMap,
          latestStateMap,
          timeoutId: config.timeoutId,
          onChange
        });

        switch (status) {
          case ENTERING:
            if (enterTimeout >= 0)
              config.timeoutId = setTimeout(() => endTransition(key), enterTimeout);
            break;

          case EXITING:
            if (exitTimeout >= 0)
              config.timeoutId = setTimeout(() => endTransition(key), exitTimeout);
            break;

          case PRE_ENTER:
          case PRE_EXIT:
            config.timeoutId = setTimeout(() => transitState(status + 1), 0);
            break;
        }
      };

      const enterStage = stateObj._status <= ENTERED;
      if (typeof toEnter !== 'boolean') toEnter = !enterStage;

      if (toEnter) {
        if (!enterStage) {
          transitState(enter ? (preEnter ? PRE_ENTER : ENTERING) : ENTERED);
          !allowMultiple &&
            latestStateMap.current.forEach((_, _key) => _key !== key && toggle(_key, false));
        }
      } else {
        if (enterStage) {
          transitState(exit ? (preExit ? PRE_EXIT : EXITING) : startOrEnd(unmountOnExit));
        }
      }
    },
    [
      onChange,
      endTransition,
      allowMultiple,
      enter,
      exit,
      preEnter,
      preExit,
      enterTimeout,
      exitTimeout,
      unmountOnExit
    ]
  );

  return { stateMap, toggle, endTransition, setItem, deleteItem };
};

export { useTransitionMap };
