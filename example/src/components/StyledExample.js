import React from 'react';
import styled from 'styled-components';
import { useTransitionState } from 'react-transition-state';
import { CodeSandbox } from './CodeSandbox';

const Container = styled.div`
  margin: 1rem;
  margin-top: 150px;
`;

const Box = styled.div`
  border: 2px solid;
  padding: 1rem;
  transition: all 500ms;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 0.5rem;

  ${({ $status }) =>
    ($status === 'preEnter' || $status === 'exiting') &&
    `
      opacity: 0;
      transform: scale(0.9);
    `}
`;

const StyledExample = () => {
  const [{ status, isMounted }, toggle] = useTransitionState({
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
        <Box $status={status}>
          <h2>status: {status}</h2>
          <p>This message is being transitioned in and out of the DOM.</p>
          <button className="btn" onClick={() => toggle(false)}>
            Close
          </button>
        </Box>
      )}
      <CodeSandbox href="https://codesandbox.io/s/react-transition-styled-3id7q" />
    </Container>
  );
};

export { StyledExample };
