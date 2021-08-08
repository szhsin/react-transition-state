import { useTransition } from 'react-transition-state';
import './App.css';

function App() {
  const [state, transition, endTransition] = useTransition({ timeout: 1500 });
  return (
    <div className="App">
      <button onClick={() => transition()}>{state}</button>
      <button onClick={endTransition}>End transition</button>
    </div>
  );
}

export default App;
