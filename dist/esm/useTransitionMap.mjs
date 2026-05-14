import { getEndStatus, getState, getTimeout, nextTick, startOrEnd } from "./internal.mjs";
import { useCallback, useState } from "react";
//#region src/useTransitionMap.ts
const updateState = (key, status, setStateMap, ref, config, onChange) => {
	if (config) {
		clearTimeout(config.t);
		cancelAnimationFrame(config.r);
	}
	const state = getState(status);
	const stateMap = new Map(ref.m);
	stateMap.set(key, state);
	setStateMap(stateMap);
	ref.m = stateMap;
	onChange?.({
		key,
		current: state
	});
};
const useTransitionMap = ({ allowMultiple, enter = true, exit = true, preEnter, preExit, timeout, initialEntered, mountOnEnter, unmountOnExit, onStateChange: onChange } = {}) => {
	const [stateMap, setStateMap] = useState(/* @__PURE__ */ new Map());
	const [ref] = useState({
		m: stateMap,
		c: /* @__PURE__ */ new Map()
	});
	const [enterTimeout, exitTimeout] = getTimeout(timeout);
	const setItem = useCallback((key, options) => {
		const { initialEntered: _initialEntered = initialEntered } = options || {};
		updateState(key, _initialEntered ? 2 : startOrEnd(mountOnEnter), setStateMap, ref);
		ref.c.set(key, { r: 0 });
	}, [
		initialEntered,
		mountOnEnter,
		ref
	]);
	const deleteItem = useCallback((key) => {
		const newStateMap = new Map(ref.m);
		if (newStateMap.delete(key)) {
			setStateMap(newStateMap);
			ref.m = newStateMap;
			ref.c.delete(key);
			return true;
		}
		return false;
	}, [ref]);
	const endTransition = useCallback((key) => {
		const state = ref.m.get(key);
		if (!state) {
			if (process.env.NODE_ENV !== "production") console.error(`[React-Transition-State] cannot call endTransition: invalid key — ${key}`);
			return;
		}
		const status = getEndStatus(state.$, unmountOnExit);
		if (status) updateState(key, status, setStateMap, ref, ref.c.get(key), onChange);
	}, [
		onChange,
		unmountOnExit,
		ref
	]);
	const toggle = useCallback((key, toEnter) => {
		const state = ref.m.get(key);
		if (!state) {
			if (process.env.NODE_ENV !== "production") console.error(`[React-Transition-State] cannot call toggle: invalid key — ${key}`);
			return;
		}
		const config = ref.c.get(key);
		const transitState = (status) => {
			updateState(key, status, setStateMap, ref, config, onChange);
			switch (status) {
				case 1:
					if (enterTimeout >= 0) config.t = setTimeout(() => endTransition(key), enterTimeout);
					break;
				case 4:
					if (exitTimeout >= 0) config.t = setTimeout(() => endTransition(key), exitTimeout);
					break;
				case 0:
				case 3:
					nextTick(() => transitState(status + 1), config);
					break;
			}
		};
		const enterStage = state.isEnter;
		if (typeof toEnter !== "boolean") toEnter = !enterStage;
		if (toEnter) {
			if (!enterStage) {
				transitState(enter ? preEnter ? 0 : 1 : 2);
				if (!allowMultiple) ref.m.forEach((_, _key) => _key !== key && toggle(_key, false));
			}
		} else if (enterStage) transitState(exit ? preExit ? 3 : 4 : startOrEnd(unmountOnExit));
	}, [
		ref,
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
			for (const key of ref.m.keys()) toggle(key, toEnter);
		}, [
			allowMultiple,
			toggle,
			ref
		]),
		endTransition,
		setItem,
		deleteItem
	};
};
//#endregion
export { useTransitionMap };
