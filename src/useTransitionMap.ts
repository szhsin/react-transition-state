import { useRef, useState, useCallback } from 'react';
import type { TransitionMapOptions, TransitionItemOptions, TransitionMapResult } from './types';
import type { Status, State } from './utils';
import {
  PRE_ENTER,
  ENTERING,
  ENTERED,
  PRE_EXIT,
  EXITING,
  startOrEnd,
  getState,
  getEndStatus,
  getTimeout,
  nextTick,
  setTimeout
} from './utils';

const updateState = <TKey>(
  key: TKey,
  status: Status,
  setStateMap: (newStateMap: Map<TKey, State>) => void,
  latestStateMap: React.RefObject<Map<TKey, State>>,
  timeoutId?: number,
  onChange?: TransitionMapOptions<TKey>['onStateChange']
) => {
  clearTimeout(timeoutId);
  const state = getState(status);
  const stateMap = new Map(latestStateMap.current);
  stateMap.set(key, state);
  setStateMap(stateMap);
  latestStateMap.current = stateMap;
  onChange && onChange({ key, current: state });
};

const useTransitionMap = <TKey>({
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
}: TransitionMapOptions<TKey> = {}): TransitionMapResult<TKey> => {
  const [stateMap, setStateMap] = useState(new Map<TKey, State>());
  const latestStateMap = useRef(stateMap);
  const configMap = useRef(new Map<TKey, { timeoutId?: number }>());
  const [enterTimeout, exitTimeout] = getTimeout(timeout);

  const setItem = useCallback(
    (key: TKey, options?: TransitionItemOptions) => {
      const { initialEntered: _initialEntered = initialEntered } = options || {};
      const status = _initialEntered ? ENTERED : startOrEnd(mountOnEnter);
      updateState(key, status, setStateMap, latestStateMap);
      configMap.current.set(key, {});
    },
    [initialEntered, mountOnEnter]
  );

  const deleteItem = useCallback((key: TKey) => {
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
    (key: TKey) => {
      const stateObj = latestStateMap.current.get(key);
      if (!stateObj) {
        process.env.NODE_ENV !== 'production' &&
          console.error(`[React-Transition-State] invalid key: ${key}`);
        return;
      }

      const { timeoutId } = configMap.current.get(key)!;
      const status = getEndStatus(stateObj._s, unmountOnExit);
      status && updateState(key, status, setStateMap, latestStateMap, timeoutId, onChange);
    },
    [onChange, unmountOnExit]
  );

  const toggle = useCallback(
    (key: TKey, toEnter?: boolean) => {
      const stateObj = latestStateMap.current.get(key);
      if (!stateObj) {
        process.env.NODE_ENV !== 'production' &&
          console.error(`[React-Transition-State] invalid key: ${key}`);
        return;
      }

      const config = configMap.current.get(key)!;

      const transitState = (status: Status) => {
        updateState(key, status, setStateMap, latestStateMap, config.timeoutId, onChange);

        switch (status) {
          case ENTERING:
            if (enterTimeout! >= 0)
              config.timeoutId = setTimeout(() => endTransition(key), enterTimeout);
            break;

          case EXITING:
            if (exitTimeout! >= 0)
              config.timeoutId = setTimeout(() => endTransition(key), exitTimeout);
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

  const toggleAll = useCallback(
    (toEnter?: boolean) => {
      if (!allowMultiple && toEnter !== false) return;
      for (const key of latestStateMap.current.keys()) toggle(key, toEnter);
    },
    [allowMultiple, toggle]
  );

  return { stateMap, toggle, toggleAll, endTransition, setItem, deleteItem };
};

export { useTransitionMap };
