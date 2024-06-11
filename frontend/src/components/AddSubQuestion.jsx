import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./SubmitForm.css";
import parse from "html-react-parser";
import { ImParagraphCenter } from "react-icons/im";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import { IoIosArrowDropdown, IoIosCheckboxOutline } from "react-icons/io";
import { BsCalendarDate } from "react-icons/bs";
import { MdDeleteOutline, MdOutlineDriveFolderUpload } from "react-icons/md";
import { GoNumber } from "react-icons/go";

const AddSubQuestion = () => {
  const { formId } = useParams();
  const navigate = useNavigate();
  const [fields, setFields] = useState([]);
  const [surveyTitle, setSurveyTitle] = useState("");
  const [surveyDescription, setSurveyDescription] = useState("");
  const [currentFieldId, setCurrentFieldId] = useState(null);
  const [currentOptionValue, setCurrentOptionValue] = useState("");
  const [subFieldLabel, setSubFieldLabel] = useState("");
  const [subFieldType, setSubFieldType] = useState("paragraph");
  const [subFieldOptions, setSubFieldOptions] = useState([]);
  const [subFields, setSubFields] = useState([]);
  const [showInput, setShowInput] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [optionError, setOptionError] = useState(false);
  const [numberRange, setNumberRange] = useState("");
  const [counter, setCounter] = useState(1); // Initialize counter state

  const handleRangeChange = (e) => {
    setNumberRange(e.target.value);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 600);
    };

    // Add event listener to window resize
    window.addEventListener("resize", handleResize);

    // Remove event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleAddSubQuestion = (id, option) => {
    setCurrentFieldId(id);
    setCurrentOptionValue(option);
    setShowInput(true);
  };

  const handleSaveSubQuestion = () => {
    const newSubField = {
      id: counter, // Assign unique ID using counter
      label: subFieldLabel,
      type: subFieldType,
      options: subFieldOptions,
      surveyId: formId,
      p_q_id: currentFieldId,
      on_value: currentOptionValue,
    };

    setSubFields([...subFields, newSubField]);
    setCounter(counter + 1); // Increment counter
    setShowInput(false);
    setSubFieldLabel("");
    setSubFieldType("paragraph");
    setSubFieldOptions([]);
    setOptionError(false);
  };

  const handleSendDataToServer = async () => {
    try {
      const response = await fetch(`http://localhost:3001/saveSubQuestion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subFields),
      });

      if (!response.ok) {
        throw new Error("Failed to save subfields");
      }

      const result = await response.json();
      console.log("Sub-fields saved successfully:", result);
      setSubFields([]);
      setFields([]);
      setSurveyTitle("");
      setSurveyDescription("");
      navigate("/success",{
        state:{message:"Sub Question Added Successfully!"}
      });
    } catch (error) {
      console.error("Error saving subfields:", error.message);
      navigate("/error",{
        state: { message: "Failed to save the form. Please try again later." },
      });
    }
  };

  const handleAddOption = () => {
    setSubFieldOptions([...subFieldOptions, ""]);
  };

  const handleOptionChange = (index, value) => {
    const updatedOptions = [...subFieldOptions];
    updatedOptions[index] = value;
    setSubFieldOptions(updatedOptions);
  };

  const handleRemoveOption = (index) => {
    const updatedOptions = [...subFieldOptions];
    updatedOptions.splice(index, 1);
    setSubFieldOptions(updatedOptions);
  };

  useEffect(() => {
    if (formId) {
      const fetchFormData = async () => {
        try {
          const response = await fetch(`http://localhost:3001/formData/${formId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch form fields");
          }
          const formData = await response.json();
          const multipleChoiceFields = formData.fields.filter((field) => field.type === "multipleChoice");
          setFields(multipleChoiceFields);
          setSurveyTitle(formData.title);
          setSurveyDescription(formData.description);
        } catch (error) {
          console.error("Error fetching form fields:", error.message);
        }
      };

      fetchFormData();
    }
  }, [formId]);

  const handleDeleteField = (id) => {
    setSubFields(subFields.filter((field) => field.id !== id));
  };

  const renderField = (field) => {
    return (
      <div className="box" key={field.id} style={{ order: field.id }}>
        <h4>{field.label}</h4>
        {field.type === "paragraph" && (
          <textarea
            className="custom-input"
            type="text"
            placeholder="Paragraph"
            disabled
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
                  disabled
                />
                <label style={{ width: "5rem" }}> {option} </label>
              </div>
            ))}
          </div>
        )}
        {field.type === "dropdown" && (
          <select className="custom-select">
            {field.options.map((option, optionIndex) => (
              <option key={optionIndex} disabled>
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
                  disabled
                />
                <label htmlFor={`option_${optionIndex}`}>{option}</label>
              </div>
            ))}
          </div>
        )}
        {field.type === "date" && (
          <input className="custom-input" type="date" disabled />
        )}
        {field.type === "number" && (
          <div>
            <input
              className="custom-input"
              type="number"
              placeholder="Number"
              disabled
            />
            <span className="number-field">
              Range: {field.options[field.options.length - 1]}
            </span>
          </div>
        )}

        <div className="footer">
          <Button
            title="Delete"
            className="btn-delete"
            size="sm"
            onClick={() => handleDeleteField(field.id)}
          >
            <MdDeleteOutline size={isMobile ? 20 : 30} />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Container>
      <Row>
        <Col>
          <div className="box-top">
            <h1>{surveyTitle}</h1>
            <div className="description">{parse(surveyDescription)}</div>
          </div>
          {fields.map((field) => (
            <div className="box" key={field.id}>
              <h3>{field.label}</h3>
              <div>
                {field.options.map((option, optionIndex) => (
                  <div className="options" key={optionIndex}>
                    <input
                      type="radio"
                      name={`option_${field.id}`}
                      value={option}
                      required={field.required}
                      disabled
                    />
                    <label style={{ width: "60%" }}>{option}</label>
                    <Button
                      className="btn-primary"
                      size="sm"
                      onClick={() => handleAddSubQuestion(field.id, option)}
                    >
                      Add Sub Question
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {subFields.map((field) => renderField(field))}
          {showInput && (
            <div className="box">
              <div className="btn-close-top">
                <Button
                  className="btn-close btn-outline-light "
                  size="sm"
                  onClick={() => setShowInput(!showInput)}
                ></Button>
              </div>
              <div className="input-box">
                <input
                  className="custom-input"
                  type="text"
                  placeholder="Enter Question"
                  value={subFieldLabel}
                  onChange={(e) => setSubFieldLabel(e.target.value)}
                />
                <div className="grid-btn">
                  <Button
                    className="field-btn"
                    variant={
                      subFieldType === "paragraph"
                        ? "primary"
                        : "outline-secondary"
                    }
                    onClick={() => setSubFieldType("paragraph")}
                  >
                    <ImParagraphCenter size={isMobile ? 15 : 25} />
                    <div> Paragraph Text</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      subFieldType === "multipleChoice"
                        ? "primary"
                        : "outline-secondary"
                    }
                    onClick={() => setSubFieldType("multipleChoice")}
                  >
                    <RiCheckboxMultipleBlankLine size={isMobile ? 15 : 30} />
                    <div> Multiple Choice</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      subFieldType === "dropdown" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setSubFieldType("dropdown")}
                  >
                    {" "}
                    <IoIosArrowDropdown size={isMobile ? 15 : 30} />{" "}
                    <div>Dropdown</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      subFieldType === "checkbox" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setSubFieldType("checkbox")}
                  >
                    <IoIosCheckboxOutline size={isMobile ? 15 : 30} />
                    <div>Checkbox</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      subFieldType === "date" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setSubFieldType("date")}
                  >
                    <BsCalendarDate size={isMobile ? 15 : 30} />
                    <div>Date</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      subFieldType === "file" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setSubFieldType("file")}
                  >
                    <MdOutlineDriveFolderUpload size={isMobile ? 15 : 35} />
                    <div>File</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      subFieldType === "number" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setSubFieldType("number")}
                  >
                    <GoNumber size={isMobile ? 20 : 30} />
                    <div>Number</div>
                  </Button>
                </div>
                <Button
                  className="submit-button"
                  variant="primary"
                  disabled={!subFieldLabel.trim()}
                  onClick={handleSaveSubQuestion}
                >
                  Add
                </Button>
              </div>
              {subFieldType === "multipleChoice" && (
                <div className="field-options">
                  {subFieldOptions.map((option, index) => (
                    <div key={index} className="option-container">
                      <input
                        className="custom-input"
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                      />
                      <Button
                        className="btn-close btn-remove-opt btn-outline-light"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      ></Button>
                    </div>
                  ))}
                  <Button className="add-option" onClick={handleAddOption}>
                    Add Option
                  </Button>
                  {optionError && (
                    <p className="error-msg">Options are required</p>
                  )}
                </div>
              )}
              {(subFieldType === "dropdown" || subFieldType === "checkbox") && (
                <div className="field-options">
                  {subFieldOptions.map((option, index) => (
                    <div key={index} className="option-container">
                      <input
                        className="custom-input"
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(index, e.target.value)
                        }
                      />
                      <Button
                        className="btn-close btn-remove-opt btn-outline-light"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      ></Button>
                    </div>
                  ))}
                  <Button className="add-option" onClick={handleAddOption}>
                    Add Option
                  </Button>
                  {optionError && (
                    <p className="error-msg">Options are required</p>
                  )}
                </div>
              )}
              {subFieldType === "number" && (
                <div className="number-field">
                  <label>Range: </label>
                  <input
                    className="custom-input"
                    type="number"
                    name="range"
                    value={numberRange}
                    onChange={handleRangeChange}
                    min="1"
                  />
                </div>
              )}
            </div>
          )}
          <div className="submit-button">
            <Button type="submit" size="sm" variant="primary" onClick={handleSendDataToServer}>
              Submit
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AddSubQuestion;
