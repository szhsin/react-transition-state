import { useRef, useState, useEffect, useCallback } from 'react';
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

const updateState = (state, setState, latestState, timeoutId, onChange) => {
  clearTimeout(timeoutId.current);
  setState(state);
  latestState.current = state;
  onChange && onChange({ state: STATES[state] });
};

export const useTransition = ({
  enter = true,
  exit = true,
  preEnter,
  preExit,
  timeout,
  initialEntered,
  mountOnEnter,
  unmountOnExit,
  onChange
} = {}) => {
  const [state, setState] = useState(initialEntered ? ENTERED : startOrEnd(mountOnEnter));
  const latestState = useRef(state);
  const timeoutId = useRef();
  const [enterTimeout, exitTimeout] = getTimeout(timeout);

  const endTransition = useCallback(() => {
    const newState = getEndState(latestState.current, unmountOnExit);
    newState && updateState(newState, setState, latestState, timeoutId, onChange);
  }, [onChange, unmountOnExit]);

  const toggle = useCallback(
    (toEnter) => {
      const transitState = (newState) => {
        updateState(newState, setState, latestState, timeoutId, onChange);

        switch (newState) {
          case ENTERING:
            if (enterTimeout >= 0) timeoutId.current = setTimeout(endTransition, enterTimeout);
            break;

          case EXITING:
            if (exitTimeout >= 0) timeoutId.current = setTimeout(endTransition, exitTimeout);
            break;

          case PRE_ENTER:
          case PRE_EXIT:
            timeoutId.current = setTimeout(() => transitState(newState + 1), 0);
            break;
        }
      };

      const enterStage = latestState.current <= ENTERED;
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
    [
      endTransition,
      onChange,
      enter,
      exit,
      preEnter,
      preExit,
      enterTimeout,
      exitTimeout,
      unmountOnExit
    ]
  );

  useEffect(() => () => clearTimeout(timeoutId.current), []);

  return [STATES[state], toggle, endTransition];
};
