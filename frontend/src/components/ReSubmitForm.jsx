import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const ReSubmitForm = () => {
  const { itsId, formId } = useParams();
  const [dataExists, setDataExists] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        const response = await fetch(`http://localhost:3001/checkSurveyData/${formId}/${itsId}`);
        if (response.ok) {
          setDataExists(true);
        } else {
          setDataExists(false);
        }
      } catch (error) {
        console.error("Error checking survey data:", error);
        setDataExists(false);
      }
    };

    fetchSurveyData();
  }, [formId, itsId]);

  useEffect(() => {
    if (dataExists === false) {
      navigate(`/survey/${formId}`);
    }
  }, [dataExists, formId, navigate]);

  const handleEditSurvey = async () => {
    try {
      await fetch(`http://localhost:3001/deleteSurveyData/${formId}/${itsId}`, { method: "DELETE" });
      navigate(`/survey/${formId}`);
    } catch (error) {
      console.error("Error deleting survey data:", error);
    }
  };

  return (
    <div className="container mt-5">
      {dataExists === null ? (
        <p className="alert">Loading...</p>
      ) : dataExists ? (
        <div className="text-center">
          <p className="alert alert-warning">Previous answers will be deleted.</p>
          <button className="btn btn-danger" onClick={handleEditSurvey}>Edit Survey</button>
        </div>
      ) : null}
    </div>
  );
};

export default ReSubmitForm;
