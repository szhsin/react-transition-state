import { _setTimeout, getEndStatus, getState, getTimeout, nextTick, startOrEnd } from "./utils.mjs";
import { useCallback, useRef, useState } from "react";
//#region src/useTransitionMap.ts
const updateState = (key, status, setStateMap, latestStateMap, timeoutId, onChange) => {
	clearTimeout(timeoutId);
	const state = getState(status);
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
	const [stateMap, setStateMap] = useState(/* @__PURE__ */ new Map());
	const latestStateMap = useRef(stateMap);
	const configMap = useRef(/* @__PURE__ */ new Map());
	const [enterTimeout, exitTimeout] = getTimeout(timeout);
	const setItem = useCallback((key, options) => {
		const { initialEntered: _initialEntered = initialEntered } = options || {};
		updateState(key, _initialEntered ? 2 : startOrEnd(mountOnEnter), setStateMap, latestStateMap);
		configMap.current.set(key, {});
	}, [initialEntered, mountOnEnter]);
	const deleteItem = useCallback((key) => {
		const newStateMap = new Map(latestStateMap.current);
		if (newStateMap.delete(key)) {
			setStateMap(newStateMap);
			latestStateMap.current = newStateMap;
			configMap.current.delete(key);
			return true;
		}
		return false;
	}, []);
	const endTransition = useCallback((key) => {
		const stateObj = latestStateMap.current.get(key);
		if (!stateObj) {
			if (process.env.NODE_ENV !== "production") console.error(`[React-Transition-State] cannot call endTransition: invalid key — ${key}`);
			return;
		}
		const { timeoutId } = configMap.current.get(key);
		const status = getEndStatus(stateObj._s, unmountOnExit);
		status && updateState(key, status, setStateMap, latestStateMap, timeoutId, onChange);
	}, [onChange, unmountOnExit]);
	const toggle = useCallback((key, toEnter) => {
		const stateObj = latestStateMap.current.get(key);
		if (!stateObj) {
			if (process.env.NODE_ENV !== "production") console.error(`[React-Transition-State] cannot call toggle: invalid key — ${key}`);
			return;
		}
		const config = configMap.current.get(key);
		const transitState = (status) => {
			updateState(key, status, setStateMap, latestStateMap, config.timeoutId, onChange);
			switch (status) {
				case 1:
					if (enterTimeout >= 0) config.timeoutId = _setTimeout(() => endTransition(key), enterTimeout);
					break;
				case 4:
					if (exitTimeout >= 0) config.timeoutId = _setTimeout(() => endTransition(key), exitTimeout);
					break;
				case 0:
				case 3:
					config.timeoutId = nextTick(transitState, status);
					break;
			}
		};
		const enterStage = stateObj.isEnter;
		if (typeof toEnter !== "boolean") toEnter = !enterStage;
		if (toEnter) {
			if (!enterStage) {
				transitState(enter ? preEnter ? 0 : 1 : 2);
				!allowMultiple && latestStateMap.current.forEach((_, _key) => _key !== key && toggle(_key, false));
			}
		} else if (enterStage) transitState(exit ? preExit ? 3 : 4 : startOrEnd(unmountOnExit));
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
		toggleAll: useCallback((toEnter) => {
			if (!allowMultiple && toEnter !== false) return;
			for (const key of latestStateMap.current.keys()) toggle(key, toEnter);
		}, [allowMultiple, toggle]),
		endTransition,
		setItem,
		deleteItem
	};
};
//#endregion
export { useTransitionMap };
