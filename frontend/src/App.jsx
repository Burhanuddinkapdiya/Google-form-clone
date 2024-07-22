import "./App.css"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormComponent from "./components/FormComponent";
import SubmitForm from "./components/SubmitForm";
import SuccessPage from "./components/pages/SuccessPage";
import ErrorPage from "./components/pages/ErrorPage";
import Report from "./components/SurveyReport";

const App = () => {
  return (<div className="main-container">
    <Router>
      <Routes>
        <Route path="/" element={<FormComponent />} />
        <Route path="/survey/:formId/:itsId" element={<SubmitForm />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/error" element={<ErrorPage />} />
        <Route path="/report" element={<Report/>} />
      </Routes>
    </Router></div>
  );
};

export default App;



