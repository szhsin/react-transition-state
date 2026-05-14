import { getEndStatus, getState, getTimeout, nextTick, startOrEnd } from "./internal.mjs";
import { useCallback, useState } from "react";
//#region src/useTransitionState.ts
const updateState = (status, setState, ref, onChange) => {
	clearTimeout(ref.t);
	cancelAnimationFrame(ref.r);
	const state = getState(status);
	setState(state);
	ref.s = state;
	onChange?.({ current: state });
};
const useTransitionState = ({ enter = true, exit = true, preEnter, preExit, timeout, initialEntered, mountOnEnter, unmountOnExit, onStateChange: onChange } = {}) => {
	const [state, setState] = useState(() => getState(initialEntered ? 2 : startOrEnd(mountOnEnter)));
	const [ref] = useState({
		s: state,
		r: 0
	});
	const [enterTimeout, exitTimeout] = getTimeout(timeout);
	const endTransition = useCallback(() => {
		const status = getEndStatus(ref.s.$, unmountOnExit);
		if (status) updateState(status, setState, ref, onChange);
	}, [
		onChange,
		unmountOnExit,
		ref
	]);
	return [
		state,
		useCallback((toEnter) => {
			const transitState = (status) => {
				updateState(status, setState, ref, onChange);
				switch (status) {
					case 1:
						if (enterTimeout >= 0) ref.t = setTimeout(endTransition, enterTimeout);
						break;
					case 4:
						if (exitTimeout >= 0) ref.t = setTimeout(endTransition, exitTimeout);
						break;
					case 0:
					case 3:
						nextTick(() => transitState(status + 1), ref);
						break;
				}
			};
			const enterStage = ref.s.isEnter;
			if (typeof toEnter !== "boolean") toEnter = !enterStage;
			if (toEnter) !enterStage && transitState(enter ? preEnter ? 0 : 1 : 2);
			else enterStage && transitState(exit ? preExit ? 3 : 4 : startOrEnd(unmountOnExit));
		}, [
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
		]),
		endTransition
	];
};
//#endregion
export { useTransitionState };
