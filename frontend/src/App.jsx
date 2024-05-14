import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormComponent from "./FormComponent";
import SubmitForm from "./SubmitForm";

const App = () => {
  return (<div className="main-container">
    <Router>
      <Routes>
        <Route path="/" element={<FormComponent />} />
        <Route path="/submit/:formId" element={<SubmitForm />} />
      </Routes>
    </Router></div>
  );
};

export default App;



