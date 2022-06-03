import { useRef, useState, useCallback } from 'react';
import {
  PRE_ENTER,
  ENTERING,
  ENTERED,
  PRE_EXIT,
  EXITING,
  STATES,
  startOrEnd,
  getEndState,
  getTimeout
} from './utils';

const initialStateMap = new Map();
const initialConfigMap = new Map();

const updateState = ({
  key,
  newState: _state,
  setStateMap,
  latestStateMap,
  timeoutId,
  onChange
}) => {
  clearTimeout(timeoutId);
  const state = { state: STATES[_state], _state };
  const stateMap = new Map(latestStateMap.current);
  stateMap.set(key, state);
  setStateMap(stateMap);
  latestStateMap.current = stateMap;
  onChange && onChange({ key, ...state });
};

const useTransitionMap = ({ singleEnter } = {}) => {
  const [stateMap, setStateMap] = useState(initialStateMap);
  const latestStateMap = useRef(stateMap);
  const configMap = useRef(initialConfigMap);

  const setItem = useCallback((key, config = {}) => {
    const { initialEntered, mountOnEnter } = config;
    const newState = initialEntered ? ENTERED : startOrEnd(mountOnEnter);
    updateState({ key, newState, setStateMap, latestStateMap });
    configMap.current.set(key, { ...config });
  }, []);

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

  const endTransition = useCallback((key) => {
    const stateObj = latestStateMap.current.get(key);
    if (!stateObj) {
      process.env.NODE_ENV !== 'production' &&
        console.error(`[React-Transition-State] invalid key: ${key}`);
      return;
    }

    const { timeoutId, onChange, unmountOnExit } = configMap.current.get(key);
    const newState = getEndState(stateObj._state, unmountOnExit);
    newState && updateState({ key, newState, setStateMap, latestStateMap, timeoutId, onChange });
  }, []);

  const toggle = useCallback(
    (key, toEnter) => {
      const stateObj = latestStateMap.current.get(key);
      if (!stateObj) {
        process.env.NODE_ENV !== 'production' &&
          console.error(`[React-Transition-State] invalid key: ${key}`);
        return;
      }

      const config = configMap.current.get(key);
      const {
        enter = true,
        exit = true,
        preEnter,
        preExit,
        timeout,
        unmountOnExit,
        onChange,
        timeoutId
      } = config;

      const transitState = (newState) => {
        updateState({ key, newState, setStateMap, latestStateMap, timeoutId, onChange });
        const [enterTimeout, exitTimeout] = getTimeout(timeout);

        switch (newState) {
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
            config.timeoutId = setTimeout(() => transitState(newState + 1), 0);
            break;
        }
      };

      const enterStage = stateObj._state <= ENTERED;
      if (typeof toEnter !== 'boolean') toEnter = !enterStage;

      if (toEnter) {
        if (!enterStage) {
          transitState(enter ? (preEnter ? PRE_ENTER : ENTERING) : ENTERED);
          singleEnter &&
            latestStateMap.current.forEach((_, _key) => _key !== key && toggle(_key, false));
        }
      } else {
        if (enterStage) {
          transitState(exit ? (preExit ? PRE_EXIT : EXITING) : startOrEnd(unmountOnExit));
        }
      }
    },
    [endTransition, singleEnter]
  );

  return { stateMap, toggle, endTransition, setItem, deleteItem };
};

export { useTransitionMap };
