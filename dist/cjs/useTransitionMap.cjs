
'use strict';
const require_utils = require('./utils.cjs');
let react = require("react");

//#region src/useTransitionMap.ts
const updateState = (key, status, setStateMap, latestStateMap, timeoutId, onChange) => {
	clearTimeout(timeoutId);
	const state = require_utils.getState(status);
	const stateMap = new Map(latestStateMap.current);
	stateMap.set(key, state);
	setStateMap(stateMap);
	latestStateMap.current = stateMap;
	onChange && onChange({
		key,
		current: state
	});
};
const useTransitionMap = ({ allowMultiple, enter = true, exit = true, preEnter, preExit, timeout, initialEntered, mountOnEnter, unmountOnExit, onStateChange: onChange } = {}) => {
	const [stateMap, setStateMap] = (0, react.useState)(/* @__PURE__ */ new Map());
	const latestStateMap = (0, react.useRef)(stateMap);
	const configMap = (0, react.useRef)(/* @__PURE__ */ new Map());
	const [enterTimeout, exitTimeout] = require_utils.getTimeout(timeout);
	const setItem = (0, react.useCallback)((key, options) => {
		const { initialEntered: _initialEntered = initialEntered } = options || {};
		updateState(key, _initialEntered ? require_utils.ENTERED : require_utils.startOrEnd(mountOnEnter), setStateMap, latestStateMap);
		configMap.current.set(key, {});
	}, [initialEntered, mountOnEnter]);
	const deleteItem = (0, react.useCallback)((key) => {
		const newStateMap = new Map(latestStateMap.current);
		if (newStateMap.delete(key)) {
			setStateMap(newStateMap);
			latestStateMap.current = newStateMap;
			configMap.current.delete(key);
			return true;
		}
		return false;
	}, []);
	const endTransition = (0, react.useCallback)((key) => {
		const stateObj = latestStateMap.current.get(key);
		if (!stateObj) {
			if (process.env.NODE_ENV !== "production") console.error(`[React-Transition-State] cannot call endTransition: invalid key — ${key}`);
			return;
		}
		const { timeoutId } = configMap.current.get(key);
		const status = require_utils.getEndStatus(stateObj._s, unmountOnExit);
		status && updateState(key, status, setStateMap, latestStateMap, timeoutId, onChange);
	}, [onChange, unmountOnExit]);
	const toggle = (0, react.useCallback)((key, toEnter) => {
		const stateObj = latestStateMap.current.get(key);
		if (!stateObj) {
			if (process.env.NODE_ENV !== "production") console.error(`[React-Transition-State] cannot call toggle: invalid key — ${key}`);
			return;
		}
		const config = configMap.current.get(key);
		const transitState = (status) => {
			updateState(key, status, setStateMap, latestStateMap, config.timeoutId, onChange);
			switch (status) {
				case require_utils.ENTERING:
					if (enterTimeout >= 0) config.timeoutId = require_utils._setTimeout(() => endTransition(key), enterTimeout);
					break;
				case require_utils.EXITING:
					if (exitTimeout >= 0) config.timeoutId = require_utils._setTimeout(() => endTransition(key), exitTimeout);
					break;
				case require_utils.PRE_ENTER:
				case require_utils.PRE_EXIT:
					config.timeoutId = require_utils.nextTick(transitState, status);
					break;
			}
		};
		const enterStage = stateObj.isEnter;
		if (typeof toEnter !== "boolean") toEnter = !enterStage;
		if (toEnter) {
			if (!enterStage) {
				transitState(enter ? preEnter ? require_utils.PRE_ENTER : require_utils.ENTERING : require_utils.ENTERED);
				!allowMultiple && latestStateMap.current.forEach((_, _key) => _key !== key && toggle(_key, false));
			}
		} else if (enterStage) transitState(exit ? preExit ? require_utils.PRE_EXIT : require_utils.EXITING : require_utils.startOrEnd(unmountOnExit));
	}, [
		onChange,
		endTransition,
		allowMultiple,
		enter,
		exit,
		preEnter,
		preExit,
		enterTimeout,
		exitTimeout,
		unmountOnExit
	]);
	return {
		stateMap,
		toggle,
		toggleAll: (0, react.useCallback)((toEnter) => {
			if (!allowMultiple && toEnter !== false) return;
			for (const key of latestStateMap.current.keys()) toggle(key, toEnter);
		}, [allowMultiple, toggle]),
		endTransition,
		setItem,
		deleteItem
	};
};

//#endregion
exports.useTransitionMap = useTransitionMap;