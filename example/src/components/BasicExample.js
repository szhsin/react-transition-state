import { useState } from 'react';
import useTransition from 'react-transition-state';
import { CodeSandbox } from './CodeSandbox';

const BasicExample = () => {
  const [unmountOnExit, setUnmountOnExit] = useState(true);
  const [{ status, isMounted }, toggle] = useTransition({
    timeout: 500,
    initialEntered: true,
    preEnter: true,
    unmountOnExit
  });

  return (
    <div className="basic-example">
      <h1>CSS example</h1>
      <div className="basic-console">
        <div className="basic-status">status: {status}</div>
        <label>
          Unmount after hiding
          <input
            type="checkbox"
            checked={unmountOnExit}
            onChange={(e) => setUnmountOnExit(e.target.checked)}
          />
        </label>
        <button className="btn" onClick={() => toggle()}>
          {status === 'entering' || status === 'entered' ? 'Hide' : 'Show'}
        </button>
        <em className="tips">
          Tip: open the browser dev tools to verify that the following message is being moved in and
          out of DOM.
        </em>
      </div>
      {isMounted && <div className={`basic-transition ${status}`}>React transition state</div>}
      <CodeSandbox href="https://codesandbox.io/s/react-transition-basic-100io" />
    </div>
  );
};

export { BasicExample };
