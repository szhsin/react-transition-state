import { renderHook, act } from '@testing-library/react-hooks';
import { useTransition } from '../';

const STATUS = Object.freeze({
  preEnter: 'preEnter',
  entering: 'entering',
  entered: 'entered',
  preExit: 'preExit',
  exiting: 'exiting',
  exited: 'exited',
  unmounted: 'unmounted'
});

const getOnChangeParams = (status) => ({ current: expect.objectContaining({ status }) });

class Result {
  constructor(result) {
    this.result = result;
  }

  get length() {
    return this.result.current.length;
  }

  get state() {
    return this.result.current[0].status;
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

const onChange = jest.fn();

test('should return correct value', () => {
  const { result } = renderTransitionHook();

  expect(result).toHaveLength(3);
  expect(result.state).toBe(STATUS.exited);
  expect(typeof result.toggleFn).toBe('function');
  expect(typeof result.endTransitionFn).toBe('function');
});

test('should toggle state', () => {
  const { result, render } = renderTransitionHook({ initialProps: { onStateChange: onChange } });
  expect(render).toHaveBeenCalledTimes(1);

  result.toggle();
  expect(result.state).toBe(STATUS.entering);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.entering));

  result.endTransition();
  expect(result.state).toBe(STATUS.entered);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.entered));

  result.toggle();
  expect(result.state).toBe(STATUS.exiting);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.exiting));

  result.endTransition();
  expect(result.state).toBe(STATUS.exited);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.exited));

  expect(render).toHaveBeenCalledTimes(5);
  expect(onChange).toHaveBeenCalledTimes(4);
});

test('should transition to specific state', () => {
  const { result, render } = renderTransitionHook({ initialProps: { onStateChange: onChange } });
  expect(render).toHaveBeenCalledTimes(1);

  result.toggle(true);
  expect(result.state).toBe(STATUS.entering);
  result.toggle(true);
  expect(result.state).toBe(STATUS.entering);
  expect(render).toHaveBeenCalledTimes(2);

  result.toggle(false);
  expect(result.state).toBe(STATUS.exiting);
  result.toggle(false);
  expect(result.state).toBe(STATUS.exiting);
  expect(render).toHaveBeenCalledTimes(3);

  result.toggle(true);
  expect(result.state).toBe(STATUS.entering);
  expect(render).toHaveBeenCalledTimes(4);

  result.endTransition();
  expect(result.state).toBe(STATUS.entered);
  // Call endTransition again intentionally
  result.endTransition();
  expect(result.state).toBe(STATUS.entered);

  expect(render).toHaveBeenCalledTimes(5);
  expect(onChange).toHaveBeenCalledTimes(4);
});

test('should update state after timeout', async () => {
  const { result, render, waitForNextUpdate } = renderTransitionHook({
    initialProps: { timeout: 50, onStateChange: onChange }
  });

  result.toggle();
  expect(result.state).toBe(STATUS.entering);
  expect(render).toHaveBeenCalledTimes(2);
  await waitForNextUpdate();
  expect(result.state).toBe(STATUS.entered);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.entered));
  expect(render).toHaveBeenCalledTimes(3);

  result.toggle();
  expect(result.state).toBe(STATUS.exiting);
  await waitForNextUpdate();
  expect(result.state).toBe(STATUS.exited);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.exited));
  expect(render).toHaveBeenCalledTimes(5);

  result.toggle();
  result.toggle();
  result.toggle();
  expect(result.state).toBe(STATUS.entering);
  await waitForNextUpdate();
  expect(result.state).toBe(STATUS.entered);
  expect(render).toHaveBeenCalledTimes(9);

  await expect(() => waitForNextUpdate({ timeout: 200 })).rejects.toThrow();
});

test('should set enter and exit timeout separately', async () => {
  const { result, render, rerender, waitForNextUpdate } = renderTransitionHook({
    initialProps: { timeout: { enter: 50 } }
  });

  result.toggle();
  expect(result.state).toBe(STATUS.entering);
  await waitForNextUpdate();
  expect(result.state).toBe(STATUS.entered);

  result.toggle();
  expect(result.state).toBe(STATUS.exiting);
  await expect(() => waitForNextUpdate({ timeout: 200 })).rejects.toThrow();
  result.endTransition();
  expect(result.state).toBe(STATUS.exited);
  expect(render).toHaveBeenCalledTimes(5);

  rerender({ timeout: { exit: 50 } });
  result.toggle();
  expect(result.state).toBe(STATUS.entering);
  await expect(() => waitForNextUpdate({ timeout: 200 })).rejects.toThrow();
  result.endTransition();
  expect(result.state).toBe(STATUS.entered);

  result.toggle();
  expect(result.state).toBe(STATUS.exiting);
  await waitForNextUpdate();
  expect(result.state).toBe(STATUS.exited);
  expect(render).toHaveBeenCalledTimes(10);
});

test('should disable enter or exit phase', () => {
  const { result, render, rerender } = renderTransitionHook({
    initialProps: { enter: false }
  });

  result.toggle();
  expect(result.state).toBe(STATUS.entered);
  result.toggle();
  expect(result.state).toBe(STATUS.exiting);
  result.endTransition();
  expect(result.state).toBe(STATUS.exited);

  rerender({ exit: false });
  result.toggle();
  expect(result.state).toBe(STATUS.entering);
  result.endTransition();
  expect(result.state).toBe(STATUS.entered);
  result.toggle();
  expect(result.state).toBe(STATUS.exited);

  rerender({ enter: false, exit: false });
  result.toggle();
  expect(result.state).toBe(STATUS.entered);
  result.toggle();
  expect(result.state).toBe(STATUS.exited);

  expect(render).toHaveBeenCalledTimes(11);
});

test('should enable preEnter or preExit state', async () => {
  const { result, render, waitForNextUpdate } = renderTransitionHook({
    initialProps: { preEnter: true, preExit: true, onStateChange: onChange }
  });

  result.toggle();
  expect(result.state).toBe(STATUS.preEnter);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.preEnter));
  await waitForNextUpdate();
  expect(result.state).toBe(STATUS.entering);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.entering));
  result.endTransition();
  expect(result.state).toBe(STATUS.entered);

  result.toggle();
  expect(result.state).toBe(STATUS.preExit);
  await waitForNextUpdate();
  expect(result.state).toBe(STATUS.exiting);
  result.endTransition();
  expect(result.state).toBe(STATUS.exited);

  expect(render).toHaveBeenCalledTimes(7);
});

test('should skip entering or exiting state', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { preEnter: true, preExit: true }
  });

  result.toggle();
  expect(result.state).toBe(STATUS.preEnter);
  result.endTransition();
  expect(result.state).toBe(STATUS.entered);

  result.toggle();
  expect(result.state).toBe(STATUS.preExit);
  result.endTransition();
  expect(result.state).toBe(STATUS.exited);

  expect(render).toHaveBeenCalledTimes(5);
});

test('should start from entered when initialEntered is set', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { initialEntered: true }
  });
  expect(result.state).toBe(STATUS.entered);
  expect(render).toHaveBeenCalledTimes(1);

  result.toggle();
  expect(result.state).toBe(STATUS.exiting);
});

test('should start from unmounted when mountOnEnter is set', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { mountOnEnter: true }
  });
  expect(result.state).toBe(STATUS.unmounted);
  expect(render).toHaveBeenCalledTimes(1);

  result.toggle();
  expect(result.state).toBe(STATUS.entering);
});

test('should unmount when unmountOnExit is set', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { unmountOnExit: true, onStateChange: onChange }
  });

  result.toggle();
  expect(result.state).toBe(STATUS.entering);
  result.endTransition();
  expect(result.state).toBe(STATUS.entered);

  result.toggle();
  expect(result.state).toBe(STATUS.exiting);
  result.endTransition();
  expect(result.state).toBe(STATUS.unmounted);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.unmounted));
  expect(render).toHaveBeenCalledTimes(5);
});

test('returned functions have stable identity across re-renders', () => {
  const onChange = () => {};
  const { result, rerender } = renderTransitionHook({
    initialProps: { onStateChange: onChange }
  });
  const prevToggle = result.toggleFn;
  const prevEndTransition = result.endTransitionFn;

  expect(result.state).toBe(STATUS.exited);
  result.toggle();
  result.endTransition();
  expect(result.state).toBe(STATUS.entered);
  rerender({ onStateChange: onChange });

  expect(result.toggleFn).toBe(prevToggle);
  expect(result.endTransitionFn).toBe(prevEndTransition);
});
