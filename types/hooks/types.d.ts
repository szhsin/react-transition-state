export type TransitionStatus = 'preEnter' | 'entering' | 'entered' | 'preExit' | 'exiting' | 'exited' | 'unmounted';
export type TransitionState = Readonly<{
    status: TransitionStatus;
    isMounted: boolean;
    isEnter: boolean;
    isResolved: boolean;
}>;
export interface TransitionOptions {
    initialEntered?: boolean;
    mountOnEnter?: boolean;
    unmountOnExit?: boolean;
    preEnter?: boolean;
    preExit?: boolean;
    enter?: boolean;
    exit?: boolean;
    timeout?: number | {
        enter?: number;
        exit?: number;
    };
    onStateChange?: (event: {
        current: TransitionState;
    }) => void;
}
export interface TransitionItemOptions {
    initialEntered?: boolean;
}
export interface TransitionMapOptions<TKey> extends Omit<TransitionOptions, 'onStateChange'> {
    allowMultiple?: boolean;
    onStateChange?: (event: {
        key: TKey;
        current: TransitionState;
    }) => void;
}
export type TransitionResult = [TransitionState, (toEnter?: boolean) => void, () => void];
export interface TransitionMapResult<TKey> {
    stateMap: ReadonlyMap<TKey, TransitionState>;
    toggle: (key: TKey, toEnter?: boolean) => void;
    toggleAll: (toEnter?: boolean) => void;
    endTransition: (key: TKey) => void;
    setItem: (key: TKey, options?: TransitionItemOptions) => void;
    deleteItem: (key: TKey) => boolean;
}
