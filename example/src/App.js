import { BasicExample } from './components/BasicExample';
import { StyledExample } from './components/StyledExample';
import { SwitchExample } from './components/SwitchExample';
import './App.css';

function App() {
  return (
    <div className="App">
      <a href="https://github.com/szhsin/react-transition-state" title="GitHub" className="github">
        <img src="GitHub-64.png" alt="GitHub" />
      </a>
      <BasicExample />
      <StyledExample />
      <SwitchExample />
    </div>
  );
}

export default App;
