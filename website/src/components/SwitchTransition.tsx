import { useTransitionState, type TransitionState } from 'react-transition-state';

// Ideal for creating switch transition for a small number of elements
// Use `useTransitionState` hook once for each element in the switch transition
export const SwitchTransition = () => {
  const transitionProps = {
    timeout: 300,
    mountOnEnter: true,
    unmountOnExit: true,
    preEnter: true
  };

  const [state1, toggle1] = useTransitionState({
    ...transitionProps,
    initialEntered: true
  });
  const [state2, toggle2] = useTransitionState(transitionProps);
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

const SwitchButton = ({
  state: { status, isMounted },
  onClick,
  children
}: { state: TransitionState } & React.ComponentPropsWithoutRef<'button'>) => {
  if (!isMounted) return null;

  return (
    <button className={`btn switch ${status}`} onClick={onClick}>
      {children}
    </button>
  );
};
