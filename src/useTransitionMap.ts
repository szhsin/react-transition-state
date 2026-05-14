import { useState, useCallback } from 'react';
import type { TransitionMapOptions, TransitionItemOptions, TransitionMapResult } from './types';
import type { Status, State, TransitionMapRef, Config } from './internal';
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
  type SetTimeout
} from './internal';

const updateState = <TKey>(
  key: TKey,
  status: Status,
  setStateMap: (newStateMap: Map<TKey, State>) => void,
  ref: TransitionMapRef<TKey>,
  config?: Config,
  onChange?: TransitionMapOptions<TKey>['onStateChange']
) => {
  if (config) {
    clearTimeout(config.t);
    cancelAnimationFrame(config.r);
  }
  const state = getState(status);
  const stateMap = new Map(ref.m);
  stateMap.set(key, state);
  setStateMap(stateMap);
  ref.m = stateMap;
  onChange?.({ key, current: state });
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
  const [ref] = useState<TransitionMapRef<TKey>>({ m: stateMap, c: new Map() });
  const [enterTimeout, exitTimeout] = getTimeout(timeout);

  const setItem = useCallback(
    (key: TKey, options?: TransitionItemOptions) => {
      const { initialEntered: _initialEntered = initialEntered } = options || {};
      const status = _initialEntered ? ENTERED : startOrEnd(mountOnEnter);
      updateState(key, status, setStateMap, ref);
      ref.c.set(key, { r: 0 });
    },
    [initialEntered, mountOnEnter, ref]
  );

  const deleteItem = useCallback(
    (key: TKey) => {
      const newStateMap = new Map(ref.m);
      if (newStateMap.delete(key)) {
        setStateMap(newStateMap);
        ref.m = newStateMap;
        ref.c.delete(key);
        return true;
      }
      return false;
    },
    [ref]
  );

  const endTransition = useCallback(
    (key: TKey) => {
      const state = ref.m.get(key);
      if (!state) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.error(`[React-Transition-State] cannot call endTransition: invalid key — ${key}`);
        }
        return;
      }

      const status = getEndStatus(state.$, unmountOnExit);
      if (status) updateState(key, status, setStateMap, ref, ref.c.get(key), onChange);
    },
    [onChange, unmountOnExit, ref]
  );

  const toggle = useCallback(
    (key: TKey, toEnter?: boolean) => {
      const state = ref.m.get(key);
      if (!state) {
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          console.error(`[React-Transition-State] cannot call toggle: invalid key — ${key}`);
        }
        return;
      }

      const config = ref.c.get(key)!;

      const transitState = (status: Status) => {
        updateState(key, status, setStateMap, ref, config, onChange);

        switch (status) {
          case ENTERING:
            if (enterTimeout! >= 0)
              config.t = (setTimeout as SetTimeout)(() => endTransition(key), enterTimeout);
            break;

          case EXITING:
            if (exitTimeout! >= 0)
              config.t = (setTimeout as SetTimeout)(() => endTransition(key), exitTimeout);
            break;

          case PRE_ENTER:
          case PRE_EXIT:
            nextTick(() => transitState((status + 1) as Status), config);
            break;
        }
      };

      const enterStage = state.isEnter;
      if (typeof toEnter !== 'boolean') toEnter = !enterStage;

      if (toEnter) {
        if (!enterStage) {
          transitState(enter ? (preEnter ? PRE_ENTER : ENTERING) : ENTERED);
          if (!allowMultiple) ref.m.forEach((_, _key) => _key !== key && toggle(_key, false));
        }
      } else {
        if (enterStage) {
          transitState(exit ? (preExit ? PRE_EXIT : EXITING) : startOrEnd(unmountOnExit));
        }
      }
    },
    [
      ref,
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
      for (const key of ref.m.keys()) toggle(key, toEnter);
    },
    [allowMultiple, toggle, ref]
  );

  return { stateMap, toggle, toggleAll, endTransition, setItem, deleteItem };
};

export { useTransitionMap };
