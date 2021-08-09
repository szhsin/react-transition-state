# React-Transition-State

[![NPM](https://img.shields.io/npm/v/react-transition-state.svg)](https://www.npmjs.com/package/react-transition-state)

## Why?

This library was inspired by the [React Transition Group](https://github.com/reactjs/react-transition-group). It allows you to easily perform animations/transitions of your React component in a [fully controlled](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#common-bugs-when-using-derived-state) manner:
- 🍭 Working with both CSS animation and transition.
- 🔄 Moving React components in and out of DOM seamlessly.
- 🚫 Using no [derived state](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html).
- 🚀 Efficient: each state transition results in at most one extract render for your component.
- 🤏 Tiny in size: ideal for both component libraries and applications.

## Install

```bash
# with npm
npm install react-transition-state

# with Yarn
yarn add react-transition-state
```

## Usage
```jsx
import { useTransition } from 'react-transition-state';

function Example() {
  const [state, toggle] = useTransition({ timeout: 750, preState: true });
  return (
    <div>
      <button onClick={() => toggle()}>toggle</button>
      <div className={`example ${state}`}>React transition state</div>
    </div>
  );
}

export default Example;
```
```css
.example {
  transition: all 0.75s;
}

.example.preEnter,
.example.exiting {
  opacity: 0;
  transform: scale(0.5);
}

.example.exited {
  display: none;
}
```
**[Edit on CodeSandbox](https://codesandbox.io/s/react-transition-basic-100io)**

## API
### `useTransition` Hook
```typescript
function useTransition(options?: TransitionOptions): [
  TransitionState,
  (toEnter?: boolean) => void,
  () => void
];
```
#### Options
Name | Type | Default | Description
------------ | ------------- | ------------- | -------------
`enter` | boolean | true | Enable or disable enter phase transitions
`exit` | boolean | true | Enable or disable exit phase transitions
`preEnter` | boolean |  | Add a 'preEnter' state immediately before 'entering'
`preExit` | boolean |  | Add a 'preExit' state immediately before 'exiting'
`initialEntered` | boolean |  | Begining from 'entered' state
`mountOnEnter` | boolean |  | State will be 'unmounted' until hit enter phase for the first time. It allows you to create lazily mounted component.
`unmountOnExit` | boolean |  |  State will become 'unmounted' after 'exiting' finishes. It allows you to transition component out of DOM.
`timeout` | number \| <br />{ enter?: number; exit?: number; } |  | Set timeout in **ms** for transitions; you can set a single value or different values for enter and exit transitions.

#### Return value
The `useTransition` Hook returns an array of values in the following order:
1. state: 'preEnter' | 'entering' | 'entered' | 'preExit' | 'exiting' | 'exited' | 'unmounted'
2. toggle: (toEnter?: boolean) => void
  - If no parameter is supplied, this function will toggle state between enter and exit phases.
  - You can set a boolean parameter to explicitly switch into one of the two phases.
3. endTransition: () => void
  - Call this function to stop transition which will turn state into 'entered' or 'exited'.
  - You will normally call this function in the `onAnimationEnd` or `onTransitionEnd` event.
  - You **must** either call this function explicitly in your code or set a timeout value in Hook options.
