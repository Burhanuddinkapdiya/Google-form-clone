import  { useState, useEffect } from "react";
import axios from "axios";
import './SurveyReport.css';
import ExportToExcel from "./pages/ExportToExcel";

const SurveyReport = () => {
  const [surveyTitles, setSurveyTitles] = useState([]);
  const [selectedSurveyId, setSelectedSurveyId] = useState("");
  const [surveyResults, setSurveyResults] = useState(null);

  useEffect(() => {
    // Fetch survey titles from the backend on component mount
    const fetchSurveyTitles = async () => {
      try {
        const response = await axios.get("http://localhost:3001/surveys");
        setSurveyTitles(response.data);
      } catch (error) {
        console.error("Error fetching survey titles:", error);
      }
    };

    fetchSurveyTitles();
  }, []);


  const handleSurveyChange = async (event) => {
    const surveyId = event.target.value;
    setSelectedSurveyId(surveyId);

    if (surveyId) {
      try {
        const response = await axios.get(`http://localhost:3001/surveyResults/${surveyId}`);
        setSurveyResults(response.data);
      } catch (error) {
        console.error("Error fetching survey results:", error);
      }
    } else {
      setSurveyResults(null); // Clear results if no survey is selected
    }

  };

  

  return (
    <div className="container">
      <div className="header">
        <h1>Survey Report</h1>
      </div>
      <div className="select-container">
        <label htmlFor="survey-select">Select a Survey:</label>
        <select id="survey-select" value={selectedSurveyId} onChange={handleSurveyChange}>
          <option value="">--Select a Survey--</option>
          {surveyTitles.map((survey) => (
            <option key={survey.id} value={survey.id}>
              {survey.title}
            </option>
          ))}
        </select>
      </div>

      {surveyResults && (
        <div className="report">
          <h2 className="title">{surveyResults.title}</h2>
          {surveyResults.questions.map((question, index) => (
            <div key={index} className="question">
              <h5>{question.label}</h5>
              <ul className="answers">
                {question.answers.map((answer, idx) => (
                  <li key={idx}>
                    {answer.text}: {answer.percentage.toFixed(2)}%
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      {selectedSurveyId && surveyResults && surveyResults.title && (
        <ExportToExcel surveyId={selectedSurveyId} surveyTitle={surveyResults.title} />
      )}
    </div>
  );
};

export default SurveyReport;
