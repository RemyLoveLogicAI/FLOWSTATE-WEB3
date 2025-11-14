import { ChatInterface } from './components/ChatInterface';
import { ThemeProvider } from './components/ThemeProvider';
import './styles/globals.css';

function App() {
  return (
    <ThemeProvider>
      <ChatInterface />
    </ThemeProvider>
  );
}

export default App;
