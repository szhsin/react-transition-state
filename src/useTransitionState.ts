import { useState, useCallback } from 'react';
import type { TransitionOptions, TransitionResult } from './types';
import type { Status, State, TransitionStateRef } from './internal';
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

const updateState = (
  status: Status,
  setState: (newState: State) => void,
  ref: TransitionStateRef,
  onChange: TransitionOptions['onStateChange']
) => {
  clearTimeout(ref.t);
  cancelAnimationFrame(ref.r);
  const state = getState(status);
  setState(state);
  ref.s = state;
  onChange?.({ current: state });
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
  const [ref] = useState<TransitionStateRef>({ s: state, r: 0 });
  const [enterTimeout, exitTimeout] = getTimeout(timeout);

  const endTransition = useCallback(() => {
    const status = getEndStatus(ref.s.$, unmountOnExit);
    if (status) updateState(status, setState, ref, onChange);
  }, [onChange, unmountOnExit, ref]);

  const toggle = useCallback(
    (toEnter?: boolean) => {
      const transitState = (status: Status) => {
        updateState(status, setState, ref, onChange);

        switch (status) {
          case ENTERING:
            if (enterTimeout! >= 0) ref.t = (setTimeout as SetTimeout)(endTransition, enterTimeout);
            break;

          case EXITING:
            if (exitTimeout! >= 0) ref.t = (setTimeout as SetTimeout)(endTransition, exitTimeout);
            break;

          case PRE_ENTER:
          case PRE_EXIT:
            nextTick(() => transitState((status + 1) as Status), ref);
            break;
        }
      };

      const enterStage = ref.s.isEnter;
      if (typeof toEnter !== 'boolean') toEnter = !enterStage;

      if (toEnter) {
        !enterStage && transitState(enter ? (preEnter ? PRE_ENTER : ENTERING) : ENTERED);
      } else {
        enterStage &&
          transitState(exit ? (preExit ? PRE_EXIT : EXITING) : startOrEnd(unmountOnExit));
      }
    },
    [
      ref,
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
