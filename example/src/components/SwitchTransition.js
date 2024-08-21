import { useTransition } from 'react-transition-state';

// Ideal for creating switch transition for a small number of elements
// Use `useTransition` hook once for each element in the switch transition
export const SwitchTransition = () => {
  const transitionProps = {
    timeout: 300,
    mountOnEnter: true,
    unmountOnExit: true,
    preEnter: true
  };

  const [state1, toggle1] = useTransition({
    ...transitionProps,
    initialEntered: true
  });
  const [state2, toggle2] = useTransition(transitionProps);
  const toggle = () => {
    toggle1();
    toggle2();
  };

  return (
    <div className="switch-container">
      <SwitchButton state={state1} onClick={toggle}>
        Button 1
      </SwitchButton>
      <SwitchButton state={state2} onClick={toggle}>
        Button 2
      </SwitchButton>
    </div>
  );
};

const SwitchButton = ({ state: { status, isMounted }, onClick, children }) => {
  if (!isMounted) return null;

  return (
    <button className={`btn switch ${status}`} onClick={onClick}>
      {children}
    </button>
  );
};
