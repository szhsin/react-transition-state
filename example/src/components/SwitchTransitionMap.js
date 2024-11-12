import { useEffect } from 'react';
import { useTransitionMap } from 'react-transition-state';

// Creating switch transitions for a large number of elements,
// or the number of elements is only known at runtime.
// `useTransitionState` doesn't suffice as React hook has the limitation that it cannot be called in a loop
const NUMBER_OF_BUTTONS = 5;
const buttonArray = new Array(NUMBER_OF_BUTTONS).fill(0).map((_, i) => `Button ${i + 1}`);

export const SwitchTransitionMap = () => {
  const transition = useTransitionMap({
    timeout: 300,
    mountOnEnter: true,
    unmountOnExit: true,
    preEnter: true
  });

  return (
    <div className="switch-container">
      {buttonArray.map((button, index) => (
        <SwitchButton
          key={index}
          itemKey={index}
          nextItemKey={(index + 1) % buttonArray.length}
          initialEntered={index === 0}
          {...transition}
        >
          {button}
        </SwitchButton>
      ))}
    </div>
  );
};

const SwitchButton = ({
  itemKey,
  nextItemKey,
  initialEntered,
  children,
  stateMap,
  toggle,
  setItem,
  deleteItem
}) => {
  useEffect(() => {
    setItem(itemKey, { initialEntered });
    return () => void deleteItem(itemKey);
  }, [setItem, deleteItem, itemKey, initialEntered]);

  const { status, isMounted } = stateMap.get(itemKey) || {};

  if (!isMounted) return null;

  return (
    <button className={`btn switch ${status}`} onClick={() => toggle(nextItemKey)}>
      {children}
    </button>
  );
};
