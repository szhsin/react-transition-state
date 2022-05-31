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
  item,
  newState: _state,
  setStateMap,
  latestStateMap,
  timeoutId,
  onChange
}) => {
  clearTimeout(timeoutId);
  const state = { state: STATES[_state], _state };
  const stateMap = new Map(latestStateMap.current);
  stateMap.set(item, state);
  setStateMap(stateMap);
  latestStateMap.current = stateMap;
  onChange && onChange(item, state);
};

const useTransitionMap = () => {
  const [stateMap, setStateMap] = useState(initialStateMap);
  const latestStateMap = useRef(stateMap);
  const configMap = useRef(initialConfigMap);

  const addItem = useCallback((item, config) => {
    const { initialEntered, mountOnEnter } = config;
    const newState = initialEntered ? ENTERED : startOrEnd(mountOnEnter);
    updateState({ item, newState, setStateMap, latestStateMap });
    configMap.current.set(item, config);
  }, []);

  const removeItem = useCallback((item) => {
    const newStateMap = new Map(latestStateMap.current);
    if (newStateMap.delete(item)) {
      setStateMap(newStateMap);
      latestStateMap.current = newStateMap;
      configMap.current.delete(item);
    }
  }, []);

  const endTransition = useCallback((item) => {
    const stateObj = latestStateMap.current.get(item);
    if (!stateObj) {
      process.env.NODE_ENV !== 'production' &&
        console.error(`[React-Transition-State] invalid item key for ${item}`);
      return;
    }

    const { timeoutId, onChange, unmountOnExit } = configMap.current.get(item);
    const newState = getEndState(stateObj._state, unmountOnExit);
    newState && updateState({ item, newState, setStateMap, latestStateMap, timeoutId, onChange });
  }, []);

  const toggle = useCallback(
    (item, toEnter) => {
      const stateObj = latestStateMap.current.get(item);
      if (!stateObj) {
        process.env.NODE_ENV !== 'production' &&
          console.error(`[React-Transition-State] invalid item key for ${item}`);
        return;
      }

      const config = configMap.current.get(item);
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
        updateState({ item, newState, setStateMap, latestStateMap, timeoutId, onChange });
        const [enterTimeout, exitTimeout] = getTimeout(timeout);

        switch (newState) {
          case ENTERING:
            if (enterTimeout >= 0)
              config.timeoutId = setTimeout(() => endTransition(item), enterTimeout);
            break;

          case EXITING:
            if (exitTimeout >= 0)
              config.timeoutId = setTimeout(() => endTransition(item), exitTimeout);
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
        }
      } else {
        if (enterStage) {
          transitState(exit ? (preExit ? PRE_EXIT : EXITING) : startOrEnd(unmountOnExit));
        }
      }
    },
    [endTransition]
  );

  return { stateMap, toggle, endTransition, addItem, removeItem };
};

export { useTransitionMap };
