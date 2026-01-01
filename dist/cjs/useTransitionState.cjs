
'use strict';
const require_utils = require('./utils.cjs');
let react = require("react");

//#region src/useTransitionState.ts
const updateState = (status, setState, latestState, timeoutId, onChange) => {
	clearTimeout(timeoutId.current);
	const state = require_utils.getState(status);
	setState(state);
	latestState.current = state;
	onChange && onChange({ current: state });
};
const useTransitionState = ({ enter = true, exit = true, preEnter, preExit, timeout, initialEntered, mountOnEnter, unmountOnExit, onStateChange: onChange } = {}) => {
	const [state, setState] = (0, react.useState)(() => require_utils.getState(initialEntered ? require_utils.ENTERED : require_utils.startOrEnd(mountOnEnter)));
	const latestState = (0, react.useRef)(state);
	const timeoutId = (0, react.useRef)(0);
	const [enterTimeout, exitTimeout] = require_utils.getTimeout(timeout);
	const endTransition = (0, react.useCallback)(() => {
		const status = require_utils.getEndStatus(latestState.current._s, unmountOnExit);
		status && updateState(status, setState, latestState, timeoutId, onChange);
	}, [onChange, unmountOnExit]);
	return [
		state,
		(0, react.useCallback)((toEnter) => {
			const transitState = (status) => {
				updateState(status, setState, latestState, timeoutId, onChange);
				switch (status) {
					case require_utils.ENTERING:
						if (enterTimeout >= 0) timeoutId.current = require_utils._setTimeout(endTransition, enterTimeout);
						break;
					case require_utils.EXITING:
						if (exitTimeout >= 0) timeoutId.current = require_utils._setTimeout(endTransition, exitTimeout);
						break;
					case require_utils.PRE_ENTER:
					case require_utils.PRE_EXIT:
						timeoutId.current = require_utils.nextTick(transitState, status);
						break;
				}
			};
			const enterStage = latestState.current.isEnter;
			if (typeof toEnter !== "boolean") toEnter = !enterStage;
			if (toEnter) !enterStage && transitState(enter ? preEnter ? require_utils.PRE_ENTER : require_utils.ENTERING : require_utils.ENTERED);
			else enterStage && transitState(exit ? preExit ? require_utils.PRE_EXIT : require_utils.EXITING : require_utils.startOrEnd(unmountOnExit));
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
exports.useTransitionState = useTransitionState;