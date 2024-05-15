import { useState, useEffect } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import "./SubmitForm.css"; // Import the CSS file


const SubmitForm = () => {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDiscription, setSurveyDiscription] = useState("");
  const [surveyId, setSurveyId]= useState(null);

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
        setSurveyDiscription(formData.description)
        setSurveyId(formId);
      } catch (error) {
        console.error("Error fetching form fields:", error.message);
      }
    };
    
    fetchFormData();
  }, []);

  const handleInputChange = (fieldId, value) => {
    setFormData({ ...formData, [fieldId]: value });
  };

  const handleSubmit = () => {
    // Convert formData to an array of objects
    const formDataArray = Object.entries(formData).map(([q_id, answer]) => ({ s_id: surveyId, q_id, answer }));
  
    // Submit formDataArray to server
    fetch('http://localhost:3001/submitFormData', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formDataArray)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to save survey answer data');
      }
      console.log('Survey answer data saved successfully');
      // Reset formData
      setFormData({});
    })
    .catch(error => {
      console.error('Error saving survey answer data:', error);
    });
  };
  
 


  return (
    <Container>
      <Row>
        <Col >
        <div className="box-top">
         <h1>{surveyTitle}</h1>
        <p>{surveyDiscription}</p>
      </div>
          {fields.map((field) => (
            <div className="box" key={field.id} >
              <label>{field.label}</label>
              {field.type === "paragraph" && (
                <textarea
                  className="custom-input"
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
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
                        onChange={(e) =>
                          handleInputChange(field.id, e.target.value)
                        }
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
                        onChange={(e) =>
                          handleInputChange(field.id, e.target.value)
                        }
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
                />
              )}
              {field.type === "image" && (
                <input
                  className="custom-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleInputChange(field.id, e.target.files[0])}
                />
              )}
            </div>
          ))}
        </Col>
      </Row>
      <div className="submit-button">
      <Button  size="sm" variant="primary" onClick={handleSubmit}>
        Submit
      </Button>
      </div>
    </Container>
  );
};

export default SubmitForm;
