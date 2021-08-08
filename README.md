# React-Transition-State

[![NPM](https://img.shields.io/npm/v/react-transition-state.svg)](https://www.npmjs.com/package/react-transition-state)

## Why?

This tiny library was inspired by the [React Transition Group](https://github.com/reactjs/react-transition-group). It allows you to easily perform animations/transitions of your React component in a [fully controlled](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html#common-bugs-when-using-derived-state) manner:
- Works with both CSS animation and transition.
- NO [derived state](https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html).
- Efficient: each state transition results in at most one extract render for your component.
- Tiny in size: ideal for both component libraries and applications.

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
