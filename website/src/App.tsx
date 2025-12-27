import { BasicExample } from './components/BasicExample';
import { SwitchExample } from './components/SwitchExample';
import gitHubLogo from './assets/GitHub-64.png';
import './App.css';

function App() {
  return (
    <div className="App">
      <a
        href="https://github.com/szhsin/react-transition-state"
        target="_blank"
        rel="noopener noreferrer"
        title="GitHub"
        className="github"
      >
        <img src={gitHubLogo} alt="GitHub" />
      </a>
      <BasicExample />
      <SwitchExample />
    </div>
  );
}

export default App;
