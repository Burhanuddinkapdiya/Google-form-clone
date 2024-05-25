import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormComponent from "./components/FormComponent";
import SubmitForm from "./components/SubmitForm";
import SuccessPage from "./components/SuccessPage";
import ErrorPage from "./components/ErrorPage";
import ReSubmitForm from "./components/ReSubmitForm";

const App = () => {
  return (<div className="main-container">
    <Router>
      <Routes>
        <Route path="/" element={<FormComponent />} />
        <Route path="/survey/:formId" element={<SubmitForm />} />
        <Route path="/survey/:formId" element={<SubmitForm />} />
        <Route path="/survey/:formId/:itsId" element={<ReSubmitForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/error" element={<ErrorPage />} />
      </Routes>
    </Router></div>
  );
};

export default App;



