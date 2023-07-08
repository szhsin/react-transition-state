import React from 'react';
import styled from 'styled-components';
import { useTransition } from 'react-transition-state';

const Container = styled.div`
  margin: 1rem;
  margin-top: 200px;
`;

const Box = styled.div`
  border: 2px solid;
  padding: 1rem;
  transition: all 500ms;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 0.5rem;

  ${({ state }) =>
    (state === 'preEnter' || state === 'exiting') &&
    `
      opacity: 0;
      transform: scale(0.9);
    `}
`;

function StyledExample() {
  const [{ status: state, isMounted }, toggle] = useTransition({
    timeout: 500,
    mountOnEnter: true,
    unmountOnExit: true,
    preEnter: true
  });

  return (
    <Container>
      <h1>styled-components example</h1>
      {!isMounted && (
        <button className="btn" onClick={() => toggle(true)}>
          Show Message
        </button>
      )}
      {isMounted && (
        <Box state={state}>
          <h2>state: {state}</h2>
          <p>This message is being transitioned in and out of the DOM.</p>
          <button className="btn" onClick={() => toggle(false)}>
            Close
          </button>
        </Box>
      )}
      <a className="code-sandbox" href="https://codesandbox.io/s/react-transition-styled-3id7q">
        Edit on CodeSandbox
      </a>
    </Container>
  );
}

export default StyledExample;
