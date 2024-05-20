import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Container, Row, Col } from "react-bootstrap";
import "./SubmitForm.css"; // Import the CSS file

const SubmitForm = () => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [surveyId, setSurveyId] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const formId = window.location.pathname.split("/").pop();
        const response = await fetch(`http://localhost:3001/formData/${formId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch form fields");
        }
        const formData = await response.json();
        setFields(formData.fields);
        setSurveyTitle(formData.title);
        setSurveyDescription(formData.description);
        setSurveyId(formId);
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

    fetchFormData();
  }, [navigate]);

  const handleInputChange = (fieldId, value) => {
    let fileSize = fields.find((x) => x.id === fieldId).options[1];
    if (value instanceof File && value.size > fileSize * 1024 * 1024) {
      alert(`File size exceeds the maximum allowed size of ${fileSize} MB.`);
      return;
    }

    setFormData({ ...formData, [fieldId]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission
  
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
    formDataToSend.append('surveyId', surveyId);
  
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
      // Reset formData
      setFormData({});
      // Navigate to the success page
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
                    required={field.required ? true : false}
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
                          required={field.required ? true : false}
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
                    required={field.required ? true : false}
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
                          required={field.required ? true : false}
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
                    required={field.required ? true : false}
                  />
                )}
                {field.type === "file" && (
                  <input
                    className="custom-input"
                    type="file"
                    accept={
                      field.options[0] === ".jpeg"
                        ? ".jpg , jpeg"
                        : field.options[0]
                    }
                    name={field.id}
                    onChange={(e) => handleInputChange(field.id, e.target.files[0])}
                    required={field.required ? true : false}
                  />
                )}
                {fieldErrors[field.id] && (
                  <span className="error-message">This field is required.</span>
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
        </Col>
      </Row>
    </Container>
  );
};

export default SubmitForm;
