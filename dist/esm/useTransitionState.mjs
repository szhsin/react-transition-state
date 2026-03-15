import { _setTimeout, getEndStatus, getState, getTimeout, nextTick, startOrEnd } from "./utils.mjs";
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
	const [state, setState] = useState(() => getState(initialEntered ? 2 : startOrEnd(mountOnEnter)));
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
					case 1:
						if (enterTimeout >= 0) timeoutId.current = _setTimeout(endTransition, enterTimeout);
						break;
					case 4:
						if (exitTimeout >= 0) timeoutId.current = _setTimeout(endTransition, exitTimeout);
						break;
					case 0:
					case 3:
						timeoutId.current = nextTick(transitState, status);
						break;
				}
			};
			const enterStage = latestState.current.isEnter;
			if (typeof toEnter !== "boolean") toEnter = !enterStage;
			if (toEnter) !enterStage && transitState(enter ? preEnter ? 0 : 1 : 2);
			else enterStage && transitState(exit ? preExit ? 3 : 4 : startOrEnd(unmountOnExit));
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
