import { useRef, useState, useCallback } from 'react';
import type { TransitionOptions, TransitionResult } from './types';
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

const updateState = (
  status: Status,
  setState: (newState: State) => void,
  latestState: React.RefObject<State>,
  timeoutId: React.RefObject<number>,
  onChange: TransitionOptions['onStateChange']
) => {
  clearTimeout(timeoutId.current);
  const state = getState(status);
  setState(state);
  latestState.current = state;
  onChange && onChange({ current: state });
};

export const useTransitionState = ({
  enter = true,
  exit = true,
  preEnter,
  preExit,
  timeout,
  initialEntered,
  mountOnEnter,
  unmountOnExit,
  onStateChange: onChange
}: TransitionOptions = {}): TransitionResult => {
  const [state, setState] = useState(() =>
    getState(initialEntered ? ENTERED : startOrEnd(mountOnEnter))
  );
  const latestState = useRef(state);
  const timeoutId = useRef(0);
  const [enterTimeout, exitTimeout] = getTimeout(timeout);

  const endTransition = useCallback(() => {
    const status = getEndStatus(latestState.current._s, unmountOnExit);
    status && updateState(status, setState, latestState, timeoutId, onChange);
  }, [onChange, unmountOnExit]);

  const toggle = useCallback(
    (toEnter?: boolean) => {
      const transitState = (status: Status) => {
        updateState(status, setState, latestState, timeoutId, onChange);

        switch (status) {
          case ENTERING:
            if (enterTimeout! >= 0) timeoutId.current = setTimeout(endTransition, enterTimeout);
            break;

          case EXITING:
            if (exitTimeout! >= 0) timeoutId.current = setTimeout(endTransition, exitTimeout);
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
        !enterStage && transitState(enter ? (preEnter ? PRE_ENTER : ENTERING) : ENTERED);
      } else {
        enterStage &&
          transitState(exit ? (preExit ? PRE_EXIT : EXITING) : startOrEnd(unmountOnExit));
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

  return [state, toggle, endTransition];
};
