import { useEffect, useState } from 'react';
import './App.css';
import Alert from './Components/alert';
import Navbar from "./Components/navbar";
import TextForm from './Components/TextForm';

const MODE_KEY = 'text-utilities-mode';



function App() {
  // For Dark Mode is Enabled or not, remembered between visits
  const [mode, setMode] = useState(() => localStorage.getItem(MODE_KEY) || 'light');
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type,
    })
    setTimeout(() => {
      setAlert(null)
    }, 1500);
  }

  useEffect(() => {
    document.body.style.backgroundColor = mode === 'dark' ? '#222222' : 'white';
    localStorage.setItem(MODE_KEY, mode);
  }, [mode]);

  const toggleMode = () => {
    if (mode === 'dark') {
      setMode('light')
      showAlert("Light Mode has been Enabled", "success")
    }
    else {
      setMode('dark');
      showAlert("Dark Mode has been Enabled", "success");
    }
  }
  return (
    <>
      <Navbar title="Text Utilities" mode={mode} toggleMode={toggleMode} />
      <div className="conatiner my-3">
        <Alert alert={alert} />
        <TextForm showAlert={showAlert} heading="Enter Text To Analyze Below" mode={mode} />
      </div>

    </>

  );
}

export default App;
