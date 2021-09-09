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

test('should return correct value', () => {
  const { result } = renderTransitionHook();

  expect(result.length).toBe(3);
  expect(result.state).toBe(STATES.exited);
  expect(typeof result.toggleFn).toBe('function');
  expect(typeof result.endTransitionFn).toBe('function');
});

test('should toggle state', () => {
  const { result, render } = renderTransitionHook();
  expect(render).toHaveBeenCalledTimes(1);

  result.toggle();
  expect(result.state).toBe(STATES.entering);

  result.endTransition();
  expect(result.state).toBe(STATES.entered);

  result.toggle();
  expect(result.state).toBe(STATES.exiting);

  result.endTransition();
  expect(result.state).toBe(STATES.exited);
  expect(render).toHaveBeenCalledTimes(5);
});

test('should transition to specific state', () => {
  const { result, render } = renderTransitionHook();
  expect(render).toHaveBeenCalledTimes(1);

  result.toggle(true);
  expect(result.state).toBe(STATES.entering);
  result.toggle(true);
  expect(result.state).toBe(STATES.entering);
  expect(render).toHaveBeenCalledTimes(2);

  result.toggle(false);
  expect(result.state).toBe(STATES.exiting);
  result.toggle(false);
  expect(result.state).toBe(STATES.exiting);
  expect(render).toHaveBeenCalledTimes(3);

  result.toggle(true);
  expect(result.state).toBe(STATES.entering);
  expect(render).toHaveBeenCalledTimes(4);

  result.endTransition();
  expect(result.state).toBe(STATES.entered);
  expect(render).toHaveBeenCalledTimes(5);
});

test('should update state after timeout', async () => {
  const { result, render, waitForNextUpdate } = renderTransitionHook({
    initialProps: { timeout: 50 }
  });

  result.toggle();
  expect(result.state).toBe(STATES.entering);
  expect(render).toHaveBeenCalledTimes(2);
  await waitForNextUpdate();
  expect(result.state).toBe(STATES.entered);
  expect(render).toHaveBeenCalledTimes(3);

  result.toggle();
  expect(result.state).toBe(STATES.exiting);
  await waitForNextUpdate();
  expect(result.state).toBe(STATES.exited);
  expect(render).toHaveBeenCalledTimes(5);

  result.toggle();
  result.toggle();
  result.toggle();
  expect(result.state).toBe(STATES.entering);
  await waitForNextUpdate();
  expect(result.state).toBe(STATES.entered);
  expect(render).toHaveBeenCalledTimes(9);

  await expect(() => waitForNextUpdate({ timeout: 200 })).rejects.toThrow();
});

test('should set enter and exit timeout separately', async () => {
  const { result, render, rerender, waitForNextUpdate } = renderTransitionHook({
    initialProps: { timeout: { enter: 50 } }
  });

  result.toggle();
  expect(result.state).toBe(STATES.entering);
  await waitForNextUpdate();
  expect(result.state).toBe(STATES.entered);

  result.toggle();
  expect(result.state).toBe(STATES.exiting);
  await expect(() => waitForNextUpdate({ timeout: 200 })).rejects.toThrow();
  result.endTransition();
  expect(result.state).toBe(STATES.exited);
  expect(render).toHaveBeenCalledTimes(5);

  rerender({ timeout: { exit: 50 } });
  result.toggle();
  expect(result.state).toBe(STATES.entering);
  await expect(() => waitForNextUpdate({ timeout: 200 })).rejects.toThrow();
  result.endTransition();
  expect(result.state).toBe(STATES.entered);

  result.toggle();
  expect(result.state).toBe(STATES.exiting);
  await waitForNextUpdate();
  expect(result.state).toBe(STATES.exited);
  expect(render).toHaveBeenCalledTimes(10);
});

test('should disable enter or exit phase', () => {
  const { result, render, rerender } = renderTransitionHook({
    initialProps: { enter: false }
  });

  result.toggle();
  expect(result.state).toBe(STATES.entered);
  result.toggle();
  expect(result.state).toBe(STATES.exiting);
  result.endTransition();
  expect(result.state).toBe(STATES.exited);

  rerender({ exit: false });
  result.toggle();
  expect(result.state).toBe(STATES.entering);
  result.endTransition();
  expect(result.state).toBe(STATES.entered);
  result.toggle();
  expect(result.state).toBe(STATES.exited);

  rerender({ enter: false, exit: false });
  result.toggle();
  expect(result.state).toBe(STATES.entered);
  result.toggle();
  expect(result.state).toBe(STATES.exited);

  expect(render).toHaveBeenCalledTimes(11);
});

test('should enable preEnter or preExit state', async () => {
  const { result, render, waitForNextUpdate } = renderTransitionHook({
    initialProps: { preEnter: true, preExit: true }
  });

  result.toggle();
  expect(result.state).toBe(STATES.preEnter);
  await waitForNextUpdate();
  expect(result.state).toBe(STATES.entering);
  result.endTransition();
  expect(result.state).toBe(STATES.entered);

  result.toggle();
  expect(result.state).toBe(STATES.preExit);
  await waitForNextUpdate();
  expect(result.state).toBe(STATES.exiting);
  result.endTransition();
  expect(result.state).toBe(STATES.exited);

  expect(render).toHaveBeenCalledTimes(7);
});

test('should start from entered when initialEntered is set', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { initialEntered: true }
  });
  expect(result.state).toBe(STATES.entered);
  expect(render).toHaveBeenCalledTimes(1);

  result.toggle();
  expect(result.state).toBe(STATES.exiting);
});

test('should start from unmounted when mountOnEnter is set', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { mountOnEnter: true }
  });
  expect(result.state).toBe(STATES.unmounted);
  expect(render).toHaveBeenCalledTimes(1);

  result.toggle();
  expect(result.state).toBe(STATES.entering);
});

test('should unmount when unmountOnExit is set', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { unmountOnExit: true }
  });

  result.toggle();
  expect(result.state).toBe(STATES.entering);
  result.endTransition();
  expect(result.state).toBe(STATES.entered);

  result.toggle();
  expect(result.state).toBe(STATES.exiting);
  result.endTransition();
  expect(result.state).toBe(STATES.unmounted);
  expect(render).toHaveBeenCalledTimes(5);
});
