import { SwitchTransition } from './SwitchTransition';
import { SwitchTransitionMap } from './SwitchTransitionMap';
import { CodeSandbox } from './CodeSandbox';

const SwitchExample = () => (
  <div className="switch-example">
    <h1>Switch Transition</h1>
    <h3>Two elements switching</h3>
    <SwitchTransition />
    <h3>Any number of elements switching</h3>
    <SwitchTransitionMap />
    <CodeSandbox href="https://codesandbox.io/p/sandbox/react-switch-transition-x87jt8" />
  </div>
);

export { SwitchExample };
