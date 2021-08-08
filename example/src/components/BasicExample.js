import { useState } from 'react';
import { useTransition } from 'react-transition-state';

function BasicExample() {
    const [unmountOnExit, setUnmountOnExit] = useState(false);
    const [state, toggle] = useTransition({
        timeout: 750,
        initialEntered: true,
        preEnter: true,
        unmountOnExit
    });

    return (
        <div className="basic-example">
            <div className="basic-console">
                <div className="basic-state">state: {state}</div>
                <label>
                    Unmount after hiding
                    <input type="checkbox" checked={unmountOnExit}
                        onChange={e => setUnmountOnExit(e.target.checked)} />
                </label>
                <button className="btn" onClick={() => toggle()}>
                    {state === 'entering' || state === 'entered' ? 'Hide' : 'Show'}
                </button>
            </div>
            {state !== 'unmounted' &&
                <div className={`basic-transition ${state}`}>React transition state</div>
            }
        </div>
    );
}

export default BasicExample;
