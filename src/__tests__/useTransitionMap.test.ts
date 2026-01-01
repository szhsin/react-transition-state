import { renderHook, act, waitFor } from '@testing-library/react';
import { STATUS } from './testUtils';
import type {
  TransitionMapResult,
  TransitionMapOptions,
  TransitionItemOptions,
  TransitionStatus
} from '../';
import { useTransitionMap } from '../';

class Result {
  readonly result: { current: TransitionMapResult<number> };

  constructor(result: { current: TransitionMapResult<number> }) {
    this.result = result;
  }

  get current() {
    return this.result.current;
  }

  get stateMap() {
    return this.result.current.stateMap;
  }

  getStatus(key = 1) {
    return this.stateMap.get(key)?.status;
  }

  toggle({ key = 1, toEnter }: { key?: number; toEnter?: boolean } = {}) {
    act(() => {
      this.result.current.toggle(key, toEnter);
    });
  }

  toggleAll(toEnter?: boolean) {
    act(() => {
      this.result.current.toggleAll(toEnter);
    });
  }

  endTransition(key = 1) {
    act(() => {
      this.result.current.endTransition(key);
    });
  }

  setItem(key: number, options?: TransitionItemOptions) {
    act(() => {
      this.result.current.setItem(key, options);
    });
  }

  deleteItem(key: number) {
    act(() => {
      this.result.current.deleteItem(key);
    });
  }
}

const renderTransitionHook = (options: { initialProps?: TransitionMapOptions<number> } = {}) => {
  const render = vi.fn();
  const { result, ...rest } = renderHook((props) => {
    render();
    return useTransitionMap(props);
  }, options);

  return { result: new Result(result), render, ...rest };
};

const getOnChangeParams = (status: TransitionStatus, key = 1) => ({
  key,
  current: expect.objectContaining({ status })
});

const onChange = vi.fn();

test('should toggle state', () => {
  const { result, render } = renderTransitionHook({ initialProps: { onStateChange: onChange } });
  expect(render).toHaveBeenCalledTimes(1);
  result.setItem(1);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.entering);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.entering));

  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.entered);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.entered));

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.exiting);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.exiting));

  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.exited);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.exited));

  expect(render).toHaveBeenCalledTimes(6);
  expect(onChange).toHaveBeenCalledTimes(4);
});

test('should transition to specific state', () => {
  const { result, render } = renderTransitionHook({ initialProps: { onStateChange: onChange } });
  result.setItem(1);

  result.toggle({ toEnter: true });
  expect(result.getStatus()).toBe(STATUS.entering);
  result.toggle({ toEnter: true });
  expect(result.getStatus()).toBe(STATUS.entering);
  expect(render).toHaveBeenCalledTimes(3);

  result.toggle({ toEnter: false });
  expect(result.getStatus()).toBe(STATUS.exiting);
  result.toggle({ toEnter: false });
  expect(result.getStatus()).toBe(STATUS.exiting);
  expect(render).toHaveBeenCalledTimes(4);

  result.toggle({ toEnter: true });
  expect(result.getStatus()).toBe(STATUS.entering);
  expect(render).toHaveBeenCalledTimes(5);

  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.entered);
  // Call endTransition again intentionally
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.entered);

  expect(render).toHaveBeenCalledTimes(6);
  expect(onChange).toHaveBeenCalledTimes(4);
});

test('should update state after timeout', async () => {
  const { result, render } = renderTransitionHook({
    initialProps: { timeout: 50, onStateChange: onChange }
  });
  result.setItem(1);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.entering);
  expect(render).toHaveBeenCalledTimes(3);
  await waitFor(() => expect(result.getStatus()).toBe(STATUS.entered));
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.entered));
  expect(render).toHaveBeenCalledTimes(4);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.exiting);
  await waitFor(() => expect(result.getStatus()).toBe(STATUS.exited));
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.exited));
  expect(render).toHaveBeenCalledTimes(6);

  result.toggle();
  result.toggle();
  result.toggle();
  expect(result.getStatus()).toBe(STATUS.entering);
  await waitFor(() => expect(result.getStatus()).toBe(STATUS.entered));
  expect(render).toHaveBeenCalledTimes(10);

  await expect(() =>
    waitFor(() => expect(render).toHaveBeenCalledTimes(11), { timeout: 200 })
  ).rejects.toThrow();
});

test('should set enter and exit timeout separately', async () => {
  const { result, render, rerender } = renderTransitionHook({
    initialProps: { timeout: { enter: 50 } }
  });
  result.setItem(1);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.entering);
  await waitFor(() => expect(result.getStatus()).toBe(STATUS.entered));

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.exiting);
  await expect(() =>
    waitFor(() => expect(result.getStatus()).toBe(STATUS.exited), { timeout: 200 })
  ).rejects.toThrow();
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.exited);
  expect(render).toHaveBeenCalledTimes(6);

  rerender({ timeout: { exit: 50 } });
  result.toggle();
  expect(result.getStatus()).toBe(STATUS.entering);
  await expect(() =>
    waitFor(() => expect(result.getStatus()).toBe(STATUS.entered), { timeout: 200 })
  ).rejects.toThrow();
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.entered);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.exiting);
  await waitFor(() => expect(result.getStatus()).toBe(STATUS.exited));
  expect(render).toHaveBeenCalledTimes(11);
});

test('should disable enter or exit phase', () => {
  const { result, render, rerender } = renderTransitionHook({
    initialProps: { enter: false }
  });
  result.setItem(1);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.entered);
  result.toggle();
  expect(result.getStatus()).toBe(STATUS.exiting);
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.exited);

  rerender({ exit: false });
  result.toggle();
  expect(result.getStatus()).toBe(STATUS.entering);
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.entered);
  result.toggle();
  expect(result.getStatus()).toBe(STATUS.exited);

  rerender({ enter: false, exit: false });
  result.toggle();
  expect(result.getStatus()).toBe(STATUS.entered);
  result.toggle();
  expect(result.getStatus()).toBe(STATUS.exited);

  expect(render).toHaveBeenCalledTimes(12);
});

test('should enable preEnter or preExit state', async () => {
  const { result, render } = renderTransitionHook({
    initialProps: { preEnter: true, preExit: true, onStateChange: onChange }
  });
  result.setItem(1);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.preEnter);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.preEnter));
  await waitFor(() => expect(result.getStatus()).toBe(STATUS.entering));
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.entering));
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.entered);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.preExit);
  await waitFor(() => expect(result.getStatus()).toBe(STATUS.exiting));
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.exited);

  expect(render).toHaveBeenCalledTimes(8);
});

test('should skip entering or exiting state', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { preEnter: true, preExit: true }
  });
  result.setItem(1);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.preEnter);
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.entered);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.preExit);
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.exited);

  expect(render).toHaveBeenCalledTimes(6);
});

test('should start from entered when initialEntered is set', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { initialEntered: true }
  });
  result.setItem(1);
  result.setItem(2, { initialEntered: false });
  result.setItem(3);
  expect(result.getStatus(1)).toBe(STATUS.entered);
  expect(result.getStatus(2)).toBe(STATUS.exited);
  expect(result.getStatus(3)).toBe(STATUS.entered);
  expect(render).toHaveBeenCalledTimes(4);

  result.toggle({ key: 2 });
  expect(result.getStatus(1)).toBe(STATUS.exiting);
  expect(result.getStatus(2)).toBe(STATUS.entering);
  expect(result.getStatus(3)).toBe(STATUS.exiting);
  expect(render).toHaveBeenCalledTimes(5);
});

test('should unmount when unmountOnExit is set', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { unmountOnExit: true, onStateChange: onChange }
  });
  result.setItem(1);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.entering);
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.entered);

  result.toggle();
  expect(result.getStatus()).toBe(STATUS.exiting);
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.unmounted);
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.unmounted));
  expect(render).toHaveBeenCalledTimes(6);
});

test('returned functions have stable identity across re-renders', () => {
  const initialProps = { onStateChange: () => {}, mountOnEnter: true };
  const { result, rerender } = renderTransitionHook({
    initialProps
  });
  const prev = { ...result.current };
  result.setItem(1);
  result.setItem(2);

  expect(result.getStatus()).toBe(STATUS.unmounted);
  result.toggle();
  expect(result.getStatus()).toBe(STATUS.entering);
  result.endTransition();
  expect(result.getStatus()).toBe(STATUS.entered);
  rerender({ ...initialProps });

  expect(result.current.toggle).toBe(prev.toggle);
  expect(result.current.endTransition).toBe(prev.endTransition);
  expect(result.current.setItem).toBe(prev.setItem);
  expect(result.current.deleteItem).toBe(prev.deleteItem);

  rerender({ ...initialProps, onStateChange: () => {} });
  expect(result.current.toggle).not.toBe(prev.toggle);
  expect(result.current.endTransition).not.toBe(prev.endTransition);
  expect(result.current.setItem).toBe(prev.setItem);
  expect(result.current.deleteItem).toBe(prev.deleteItem);
});

test('should set and delete items', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  const { result } = renderTransitionHook();
  result.setItem(1);
  result.setItem(2, { initialEntered: true });
  result.setItem(3);
  result.toggle({ key: 1 });
  result.endTransition(1);

  expect(result.getStatus(1)).toBe(STATUS.entered);
  expect(result.getStatus(2)).toBe(STATUS.exiting);
  expect(result.getStatus(3)).toBe(STATUS.exited);

  result.deleteItem(1);
  expect(result.getStatus(1)).toBeUndefined();
  // Call deleteItem again intentionally
  result.deleteItem(1);
  expect(errorSpy).not.toHaveBeenCalled();
  result.toggle({ key: 1 });
  expect(errorSpy).toHaveBeenCalledTimes(1);
  result.endTransition(1);
  expect(errorSpy).toHaveBeenCalledTimes(2);
  errorSpy.mockRestore();
});

test('should allow mutiple items to enter', () => {
  const { result } = renderTransitionHook({
    initialProps: { allowMultiple: true, onStateChange: onChange }
  });
  result.setItem(1);
  result.setItem(2);
  result.setItem(3);
  result.toggle({ key: 1 });
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.entering, 1));
  result.toggle({ key: 3 });
  expect(onChange).toHaveBeenLastCalledWith(getOnChangeParams(STATUS.entering, 3));

  expect(result.getStatus(1)).toBe(STATUS.entering);
  expect(result.getStatus(2)).toBe(STATUS.exited);
  expect(result.getStatus(3)).toBe(STATUS.entering);
});

test('should toggle all items when allowing multiple', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { enter: false, exit: false, allowMultiple: true, onStateChange: onChange }
  });
  result.setItem(1, { initialEntered: true });
  result.setItem(2);
  result.setItem(3, { initialEntered: true });
  expect(result.getStatus(1)).toBe(STATUS.entered);
  expect(result.getStatus(2)).toBe(STATUS.exited);
  expect(result.getStatus(3)).toBe(STATUS.entered);

  result.toggleAll();
  expect(result.getStatus(1)).toBe(STATUS.exited);
  expect(result.getStatus(2)).toBe(STATUS.entered);
  expect(result.getStatus(3)).toBe(STATUS.exited);

  result.toggleAll(true);
  expect(result.getStatus(1)).toBe(STATUS.entered);
  expect(result.getStatus(2)).toBe(STATUS.entered);
  expect(result.getStatus(3)).toBe(STATUS.entered);

  result.toggleAll(false);
  expect(result.getStatus(1)).toBe(STATUS.exited);
  expect(result.getStatus(2)).toBe(STATUS.exited);
  expect(result.getStatus(3)).toBe(STATUS.exited);

  expect(onChange).toHaveBeenNthCalledWith(1, getOnChangeParams(STATUS.exited, 1));
  expect(onChange).toHaveBeenNthCalledWith(2, getOnChangeParams(STATUS.entered, 2));
  expect(onChange).toHaveBeenNthCalledWith(3, getOnChangeParams(STATUS.exited, 3));
  expect(onChange).toHaveBeenCalledTimes(8);
  expect(render).toHaveBeenCalledTimes(7);
});

test('should only close all items when not allowing multiple', () => {
  const { result, render } = renderTransitionHook({
    initialProps: { enter: false, exit: false, onStateChange: onChange }
  });
  result.setItem(1, { initialEntered: true });
  result.setItem(2);
  result.setItem(3, { initialEntered: true });
  expect(result.getStatus(1)).toBe(STATUS.entered);
  expect(result.getStatus(2)).toBe(STATUS.exited);
  expect(result.getStatus(3)).toBe(STATUS.entered);

  result.toggleAll();
  expect(result.getStatus(1)).toBe(STATUS.entered);
  expect(result.getStatus(2)).toBe(STATUS.exited);
  expect(result.getStatus(3)).toBe(STATUS.entered);

  result.toggleAll(true);
  expect(result.getStatus(1)).toBe(STATUS.entered);
  expect(result.getStatus(2)).toBe(STATUS.exited);
  expect(result.getStatus(3)).toBe(STATUS.entered);

  result.toggleAll(false);
  expect(result.getStatus(1)).toBe(STATUS.exited);
  expect(result.getStatus(2)).toBe(STATUS.exited);
  expect(result.getStatus(3)).toBe(STATUS.exited);

  expect(onChange).toHaveBeenNthCalledWith(1, getOnChangeParams(STATUS.exited, 1));
  expect(onChange).toHaveBeenNthCalledWith(2, getOnChangeParams(STATUS.exited, 3));
  expect(onChange).toHaveBeenCalledTimes(2);
  expect(render).toHaveBeenCalledTimes(5);
});
