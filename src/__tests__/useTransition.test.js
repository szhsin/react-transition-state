import { renderHook, act } from '@testing-library/react-hooks';
import { useTransition } from '../';

const STATES = Object.freeze({
  preEnter: 'preEnter',
  entering: 'entering',
  entered: 'entered',
  preExit: 'preExit',
  exiting: 'exiting',
  exited: 'exited',
  unmounted: 'unmounted'
});

class Result {
  constructor(result) {
    this.result = result;
  }

  get length() {
    return this.result.current.length;
  }

  get state() {
    return this.result.current[0];
  }

  get toggleFn() {
    return this.result.current[1];
  }

  get endTransitionFn() {
    return this.result.current[2];
  }

  toggle(toEnter) {
    act(() => {
      this.toggleFn(toEnter);
    });
  }

  endTransition() {
    act(() => {
      this.endTransitionFn();
    });
  }
}

const renderTransitionHook = (options) => {
  const render = jest.fn();
  const { result, ...rest } = renderHook((props) => {
    render();
    return useTransition(props);
  }, options);

  return { result: new Result(result), render, ...rest };
};
