const STATUS = [
	"preEnter",
	"entering",
	"entered",
	"preExit",
	"exiting",
	"exited",
	"unmounted"
];
const getState = (status) => ({
	$: status,
	status: STATUS[status],
	isEnter: status < 3,
	isMounted: status !== 6,
	isResolved: status === 2 || status > 4
});
const startOrEnd = (unmounted) => unmounted ? 6 : 5;
const getEndStatus = (status, unmountOnExit) => {
	switch (status) {
		case 1:
		case 0: return 2;
		case 4:
		case 3: return startOrEnd(unmountOnExit);
	}
};
const getTimeout = (timeout) => typeof timeout === "object" ? [timeout.enter, timeout.exit] : [timeout, timeout];
const nextTick = (callback, config) => {
	config.r = requestAnimationFrame(() => {
		config.r = requestAnimationFrame(callback);
	});
};
//#endregion
export { getEndStatus, getState, getTimeout, nextTick, startOrEnd };
