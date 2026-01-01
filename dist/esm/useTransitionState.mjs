import { ENTERED, ENTERING, EXITING, PRE_ENTER, PRE_EXIT, _setTimeout, getEndStatus, getState, getTimeout, nextTick, startOrEnd } from "./utils.mjs";
import { useCallback, useRef, useState } from "react";

//#region src/useTransitionState.ts
const updateState = (status, setState, latestState, timeoutId, onChange) => {
	clearTimeout(timeoutId.current);
	const state = getState(status);
	setState(state);
	latestState.current = state;
	onChange && onChange({ current: state });
};
const useTransitionState = ({ enter = true, exit = true, preEnter, preExit, timeout, initialEntered, mountOnEnter, unmountOnExit, onStateChange: onChange } = {}) => {
	const [state, setState] = useState(() => getState(initialEntered ? ENTERED : startOrEnd(mountOnEnter)));
	const latestState = useRef(state);
	const timeoutId = useRef(0);
	const [enterTimeout, exitTimeout] = getTimeout(timeout);
	const endTransition = useCallback(() => {
		const status = getEndStatus(latestState.current._s, unmountOnExit);
		status && updateState(status, setState, latestState, timeoutId, onChange);
	}, [onChange, unmountOnExit]);
	return [
		state,
		useCallback((toEnter) => {
			const transitState = (status) => {
				updateState(status, setState, latestState, timeoutId, onChange);
				switch (status) {
					case ENTERING:
						if (enterTimeout >= 0) timeoutId.current = _setTimeout(endTransition, enterTimeout);
						break;
					case EXITING:
						if (exitTimeout >= 0) timeoutId.current = _setTimeout(endTransition, exitTimeout);
						break;
					case PRE_ENTER:
					case PRE_EXIT:
						timeoutId.current = nextTick(transitState, status);
						break;
				}
			};
			const enterStage = latestState.current.isEnter;
			if (typeof toEnter !== "boolean") toEnter = !enterStage;
			if (toEnter) !enterStage && transitState(enter ? preEnter ? PRE_ENTER : ENTERING : ENTERED);
			else enterStage && transitState(exit ? preExit ? PRE_EXIT : EXITING : startOrEnd(unmountOnExit));
		}, [
			endTransition,
			onChange,
			enter,
			exit,
			preEnter,
			preExit,
			enterTimeout,
			exitTimeout,
			unmountOnExit
		]),
		endTransition
	];
};

//#endregion
export { useTransitionState };