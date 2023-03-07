import logo from "./logo.svg";
import "./App.css";
import Button from "./components/common/element/Button";
import TextInput from "./components/TextInput";

function App() {
  return (
    <div className="App">
      <div>
        <TextInput />
        <Button />
      </div>
    </div>
  );
}

export default App;
