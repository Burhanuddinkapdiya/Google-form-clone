import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';
import "./SubmitForm.css"; // Import the CSS file

const SubmitForm = () => {
  const { itsId, formId } = useParams();
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [dataExists, setDataExists] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (formId && itsId) {
      // Fetch form data based on formId
      const fetchFormData = async () => {
        try {
          const response = await fetch(`http://localhost:3001/formData/${formId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch form fields");
          }
          const formData = await response.json();
          setFields(formData.fields);
          setSurveyTitle(formData.title);
          setSurveyDescription(formData.description);

          // Initialize field errors state
          const initialFieldErrors = {};
          formData.fields.forEach((field) => {
            if (field.required) {
              initialFieldErrors[field.id] = false;
            }
          });
          setFieldErrors(initialFieldErrors);
        } catch (error) {
          console.error("Error fetching form fields:", error.message);
          navigate("/error", { state: { message: "Failed to fetch form data." } });
        }
      };

      // Check if survey data exists for the given formId and itsId
      const fetchSurveyData = async () => {
        try {
          const response = await fetch(`http://localhost:3001/checkSurveyData/${formId}/${itsId}`);
          if (response.ok) {
            setDataExists(true); // Data exists
          } else {
            setDataExists(false); // No data
          }
        } catch (error) {
          console.error("Error checking survey data:", error);
          setDataExists(false);
        }
      };

      fetchFormData();
      fetchSurveyData();
    }
  }, [formId, itsId, navigate]);

  useEffect(() => {
    // Navigate to the survey page if no data exists
    if (dataExists === false) {
      navigate(`/survey/${formId}/${itsId}`);
    }
  }, [dataExists, formId, itsId, navigate]);

  const handleEditSurvey = async () => {
    try {
      await fetch(`http://localhost:3001/deleteSurveyData/${formId}/${itsId}`, { method: "DELETE" });
      setDataExists(false);
      navigate(`/survey/${formId}/${itsId}`);
      
    } catch (error) {
      console.error("Error deleting survey data:", error);
    }
  };

  const handleInputChange = (fieldId, value) => {
    const field = fields.find((x) => x.id === fieldId);
    if (field && field.type === "file") {
      const fileSizeLimit = field.options[1]; // Assuming options[1] is the file size limit in MB
      if (value instanceof File && value.size > fileSizeLimit * 1024 * 1024) {
        alert(`File size exceeds the maximum allowed size of ${fileSizeLimit} MB.`);
        return;
      }
    }

    setFormData({ ...formData, [fieldId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const newFieldErrors = {};
    fields.forEach((field) => {
      const value = formData[field.id];
      if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        newFieldErrors[field.id] = true;
      }
    });
    setFieldErrors(newFieldErrors);

    // If any required field is empty or only whitespace, prevent form submission
    if (Object.values(newFieldErrors).some((error) => error)) {
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('surveyId', formId);
    formDataToSend.append('itsId', itsId);

    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    try {
      const response = await fetch("http://localhost:3001/submitFormData", {
        method: "POST",
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error("Failed to save survey answer data");
      }

      console.log("Survey answer data saved successfully");
      setFormData({});
      navigate("/success");
    } catch (error) {
      console.error("Error saving survey answer data:", error);
      navigate("/error", { state: { message: "Failed to submit form data." } });
    }
  };

  return (
    <Container>
      <Row>
        <Col>
          {dataExists === null ? (
            <p className="alert">Loading...</p>
          ) : dataExists ? (
            <div className="text-center">
              <p className="alert alert-warning">Previous answers will be deleted.</p>
              <button className="btn btn-danger" onClick={handleEditSurvey}>Edit Survey</button>
            </div>
          ) : (
            <div>
              <div className="box-top">
                <h1>{surveyTitle}</h1>
                <p>{surveyDescription}</p>
              </div>
              <form onSubmit={handleSubmit} method="post" encType="multipart/form-data" noValidate>
                {fields.map((field) => (
                  <div className="box" key={field.id}>
                    <label>{field.label}</label>
                    {field.type === "paragraph" && (
                      <textarea
                        className="custom-input"
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    )}

                    {field.type === "multipleChoice" && (
                      <div>
                        {field.options.map((option, optionIndex) => (
                          <div className="options" key={optionIndex}>
                            <input
                              type="radio"
                              name={`option_${field.id}`}
                              value={option}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              required={field.required}
                            />
                            {option}
                          </div>
                        ))}
                      </div>
                    )}
                    {field.type === "dropdown" && (
                      <select
                        className="custom-select"
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                      >
                        <option value="">Select {field.label}</option>
                        {field.options.map((option, optionIndex) => (
                          <option key={optionIndex} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}
                    {field.type === "checkbox" && (
                      <div>
                        {field.options.map((option, optionIndex) => (
                          <div className="options" key={optionIndex}>
                            <input
                              className="custom-checkbox"
                              type="checkbox"
                              id={`option_${optionIndex}`}
                              name={`option_${field.id}`}
                              value={option}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              required={field.required}
                            />
                            <label htmlFor={`option_${optionIndex}`}>{option}</label>
                          </div>
                        ))}
                      </div>
                    )}
                    {field.type === "date" && (
                      <input
                        className="custom-input"
                        type="date"
                        onChange={(e) => handleInputChange(field.id, e.target.value)}
                        required={field.required}
                      />
                    )}
                    {field.type === "file" && (
                      <input
                        className="custom-input"
                        type="file"
                        accept={
                          field.options[0] === ".jpeg"
                            ? ".jpg, .jpeg"
                            : field.options[0]
                        }
                        name={field.id}
                        onChange={(e) => handleInputChange(field.id, e.target.files[0])}
                        required={field.required}
                      />
                    )}
                    {fieldErrors[field.id] && (
                      <span className="field-error-message">This field is required.</span>
                    )}
                  </div>
                ))}
                <div className="submit-button">
                  <Button
                    type="submit"
                    size="sm"
                    variant="primary"
                  >
                    Submit
                  </Button>
                </div>
              </form>
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default SubmitForm;
