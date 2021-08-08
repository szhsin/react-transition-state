import { useTransition } from 'react-transition-state';

function BasicExample() {
    const [state, transition] = useTransition({
        timeout: 750,
        initialEntered: true,
        preState: true
    });

    return (
        <div className="basic-example">
            <div className="basic-console">
                <div className="basic-state">state: {state}</div>
                <button className="btn" onClick={() => transition()}>
                    {state === 'entering' || state === 'entered' ? 'Hide' : 'Show'}
                </button>
            </div>
            <div className={`basic-transition ${state}`}>React transition state</div>
        </div>
    );
}

export default BasicExample;
