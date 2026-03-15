"use strict";
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
	_s: status,
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
const _setTimeout = (...args) => setTimeout(...args);
const nextTick = (transitState, status) => _setTimeout(() => {
	isNaN(document.body.offsetTop) || transitState(status + 1);
}, 0);
//#endregion
exports._setTimeout = _setTimeout;
exports.getEndStatus = getEndStatus;
exports.getState = getState;
exports.getTimeout = getTimeout;
exports.nextTick = nextTick;
exports.startOrEnd = startOrEnd;
