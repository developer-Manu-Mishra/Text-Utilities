import { useState } from 'react';
import './App.css';
import Alert from './Components/alert';
import Navbar from "./Components/navbar";
import TextForm from './Components/TextForm';




function App() {
  const [mode, setMode] = useState('light'); // For Dark Mode is Enabled or not
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

  const toggleMode = () => {
    if (mode === 'dark') {
      setMode('light')
      showAlert("Light Mode has been Enabled", "success")

      document.body.style.backgroundColor = "white";
    }
    else {
      setMode('dark');
      document.body.style.backgroundColor = "#222222";
      showAlert("Dark Mode has been Enabled", "success");

    }
  }
  return (
    <>
      {/* <Router>
        
          <Navbar title="TextUtils" mode={mode} toggleMode={toggleMode} />
          <div className="conatiner my-3">
          <Alert alert={alert} />


          <Switch>
            <Route path="/">
              <TextForm showAlert={showAlert} heading="Enter Text To Analyze Below" mode={mode} />
            </Route>
            <Route path="/about">
              <About />
            </Route>
          </Switch>
        </div>
      </Router> */}
      <Navbar title="Text Utilities" mode={mode} toggleMode={toggleMode} />
      <div className="conatiner my-3">
        <Alert alert={alert} />
        <TextForm showAlert={showAlert} heading="Enter Text To Analyze Below" mode={mode} />
      </div>

    </>

  );
}

export default App;
