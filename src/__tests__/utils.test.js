import {
  getState,
  PRE_ENTER,
  ENTERING,
  ENTERED,
  PRE_EXIT,
  EXITING,
  EXITED,
  UNMOUNTED
} from '../hooks/utils';

test('getState', () => {
  expect(getState(PRE_ENTER)).toEqual(
    expect.objectContaining({ isEnter: true, isMounted: true, isResolved: false })
  );
  expect(getState(ENTERING)).toEqual(
    expect.objectContaining({ isEnter: true, isMounted: true, isResolved: false })
  );
  expect(getState(ENTERED)).toEqual(
    expect.objectContaining({ isEnter: true, isMounted: true, isResolved: true })
  );
  expect(getState(PRE_EXIT)).toEqual(
    expect.objectContaining({ isEnter: false, isMounted: true, isResolved: false })
  );
  expect(getState(EXITING)).toEqual(
    expect.objectContaining({ isEnter: false, isMounted: true, isResolved: false })
  );
  expect(getState(EXITED)).toEqual(
    expect.objectContaining({ isEnter: false, isMounted: true, isResolved: true })
  );
  expect(getState(UNMOUNTED)).toEqual(
    expect.objectContaining({ isEnter: false, isMounted: false, isResolved: true })
  );
});
