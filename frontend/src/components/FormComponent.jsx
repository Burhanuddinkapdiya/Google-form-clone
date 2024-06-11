import { useEffect, useState } from "react";
import { Button, Container, Row, Col} from "react-bootstrap";
import { ImParagraphCenter } from "react-icons/im";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoIosCheckboxOutline } from "react-icons/io";
import { BsCalendarDate } from "react-icons/bs";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import { MdOutlineDriveFolderUpload } from "react-icons/md";
import { MdDeleteOutline } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { IoAdd } from "react-icons/io5";
import { GoNumber } from "react-icons/go";
import "./FormComponent.css"; // Import the CSS file
import TextEditor from "./TextEditor";
import { useNavigate} from "react-router-dom";

const FormComponent = () => {
  const navigate = useNavigate();

  const [fields, setFields] = useState([]);
  const [fieldType, setFieldType] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldOptions, setFieldOptions] = useState([]);
  const [fieldCounter, setFieldCounter] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [optionError, setOptionError] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  const [fileType, setFileType] = useState("");
  const [fileSize, setFileSize] = useState("");
  const [numberRange, setNumberRange] = useState("");

  const handleFileTypeChange = (type) => {
    setFileType(type);
    setFieldOptions((prevOptions) => {
      const updatedOptions = [...prevOptions]; // Create a copy of the current options
      updatedOptions[0] = type; // Assuming the first option is for file type

      return updatedOptions; // Return the updated options array
    });
  };
  const handleRangeChange = (e) => {
    setNumberRange(e.target.value);
  };

  const handleFileSizeChange = (size) => {
    setFileSize(size);
    setFieldOptions((prevOptions) => {
      const updatedOptions = [...prevOptions]; // Create a copy of the current options
      updatedOptions[1] = size; // Assuming the second option is for file size
      return updatedOptions; // Return the updated options array
    });
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

  const handleAddField = () => {
    if (
      fieldType === "paragraph" ||
      fieldType === "date" ||
      fieldType === "file" ||
      fieldType === "number"
    ) {
      if (fieldType === "number" && !numberRange) {
        return;
      }
      const newField = {
        id: editingFieldId !== null ? editingFieldId : fieldCounter,
        type: fieldType,
        label: fieldLabel,
        options:
          fieldType === "number"
            ? [numberRange]
            : [...fieldOptions.filter((option) => option.trim() !== "")],
        serialNo:
          editingFieldId !== null
            ? fields.find((field) => field.id === editingFieldId).serialNo
            : fieldCounter, // Preserve the original serialNo if editing an existing field
        p_q_id: null, // Default to null for parent fields
        on_value: null // Default to null for parent fields
      };
  
      setFields((prevFields) => [
        ...prevFields.filter((field) => field.id !== editingFieldId),
        newField,
      ]);
      setFieldCounter(fieldCounter + 1);
      setFieldType("");
      setFieldLabel("");
      setFieldOptions([]);
      setShowInput(!showInput);
      setOptionError(false);
      setEditingFieldId(null);
      setNumberRange("");
    } else if (
      fieldOptions.length === 0 ||
      fieldOptions.some((option) => option.trim() === "")
    ) {
      setOptionError(true);
      return; // Exit the function early if options are not present or contain empty options
    } else {
      const newField = {
        id: editingFieldId !== null ? editingFieldId : fieldCounter,
        type: fieldType,
        label: fieldLabel,
        options: [...fieldOptions],
        serialNo:
          editingFieldId !== null
            ? fields.find((field) => field.id === editingFieldId).serialNo
            : fieldCounter,
        p_q_id: null, // Default to null for parent fields
        on_value: null // Default to null for parent fields
      };
  
      setFields((prevFields) => [
        ...prevFields.filter((field) => field.id !== editingFieldId),
        newField,
      ]);
      setFieldCounter(fieldCounter + 1);
      setFieldType("");
      setFieldLabel("");
      setFieldOptions([]);
      setShowInput(!showInput);
      setOptionError(false);
      setEditingFieldId(null);
    }
  };
  

  const handleAddOption = () => {
    setFieldOptions([...fieldOptions, ""]);
  };
  const handleRemoveOption = (index) => {
    const updatedOptions = [...fieldOptions];
    updatedOptions.splice(index, 1);
    setFieldOptions(updatedOptions);
  };
  const handleOptionChange = (index, value) => {
    const newOptions = [...fieldOptions];
    newOptions[index] = value;
    setFieldOptions(newOptions);
  };
  // const handleDeleteOption = (fieldId, optionIndex) => {
  //   const updatedFields = fields.map((field) => {
  //     if (field.id === fieldId) {
  //       const updatedOptions = [...field.options];
  //       updatedOptions.splice(optionIndex, 1);
  //       return { ...field, options: updatedOptions };
  //     }
  //     return field;
  //   });
  //   setFields(updatedFields);
  // };

  const handleDeleteField = (id) => {
    setFields(fields.filter((field) => field.id !== id));
  };

  const handleDuplicateField = (id) => {
    const fieldToDuplicate = fields.find((field) => field.id === id);
    const duplicatedField = { ...fieldToDuplicate, id: fieldCounter };
    setFields([...fields, duplicatedField]);
    setFieldCounter(fieldCounter + 1);
  };

  const handleToggleRequired = (id) => {
    const updatedFields = fields.map((field) => {
      if (field.id === id) {
        return { ...field, required: !field.required };
      }
      return field;
    });
    setFields(updatedFields);
  };
  const handleEditOptions = (fieldId) => {
    setEditingFieldId(fieldId);
    const field = fields.find((field) => field.id === fieldId);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldOptions([...field.options]);
    setShowInput(true);
  };

  const sendDataToServer = async () => {
    try {
      // Create an object to hold form information including title, description, and fields
      const formData = {
        title: formTitle,
        description: formDescription,
        fields: fields.map((field) => {
          return {
            id: field.id,
            type: field.type,
            label: field.label,
            options: field.options,
            serialNo: field.serialNo,
            p_q_id: field.p_q_id !== undefined ? field.p_q_id : null,
            on_value: field.on_value !== undefined ? field.on_value : null,
          };
        }),
      };
      console.log(formData);
  
      // Send the formData to the server
      const response = await fetch("http://localhost:3001/saveFormData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to save form data");
      }
  
      // Extract formId from the response
      const responseData = await response.json();
      const formId = responseData.formId; // Get formId from response
      console.log("Form data saved successfully", formId);
  
      // Reset the form data
      setFields([]);
      setFieldType("");
      setFieldLabel("");
      setFieldOptions([]);
      setFieldCounter(0);
      setShowInput(false);
      setOptionError(false);
      setEditingFieldId(null);
      setFormTitle("");
      setFormDescription("");
      setNumberRange("");
  
      // Navigate to the success page with the formId
      navigate("/success", {
        state: { message: "Form Created Successfully!", formId: formId }
      });
  
      return formId; // Return formId
  
    } catch (error) {
      console.error("Error:", error.message);
      navigate("/error", {
        state: { message: "Failed to save the form. Please try again later." },
      });
    }
  };
  
  const handleAddSubQuestionProceed = async () => {
    try {
      const formId = await sendDataToServer(); // Call sendDataToServer to save form data and get formId
      if (formId) {
        // Navigate to the formId route if formId is available
        navigate(`/${formId}`);
      }
    } catch (error) {
      navigate('/error',{
        state:{message:"An error occured!!"}
      })
    }
  };

  const renderField = (field) => {
    // const subQuestions = fields.filter((subField) => subField.p_q_id === field.id);
    return (
      <>
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
              <label style={{width:"5rem"}}> {option} </label>
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
                {/* <Button
                  className="btn-close btn-outline-light"
                  size="sm"
                  onClick={() => handleDeleteOption(field.id, optionIndex)}
                ></Button> */}
              </div>
            ))}
          </div>
        )}
        {field.type === "date" && (
          <input className="custom-input" type="date" disabled />
        )}
        {/* {field.type === "time" && (
          <input className="custom-input" type="time" disabled />
        )} */}
        {field.type === "file" && (
          <input className="custom-input" type="file" disabled />
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
          <Button
            title="Edit"
            className="btn-edit"
            size="sm"
            onClick={() => handleEditOptions(field.id)}
          >
            <FaRegEdit size={isMobile ? 15 : 25} />
          </Button>
          <Button
            title="Copy"
            className="btn-copy"
            size="sm"
            onClick={() => handleDuplicateField(field.id)}
          >
            <FaRegCopy size={isMobile ? 15 : 25} />
          </Button>
          <div className="form-check form-switch">
            <label
              className="form-check-label"
              htmlFor={`required_${field.id}`}
            >
              Required
            </label>
            <input
              className="form-check-input"
              type="checkbox"
              id={`required_${field.id}`}
              checked={field.required || false}
              onChange={() => handleToggleRequired(field.id)}
            />
          </div>
        </div>
      
      </div>
        </>
      
    );
  };
  return (
    <Container className="form-container">
      <Row>
        <Col>
          <div className="box-top">
            <input
              value={formTitle}
              className="custom-input custom-input-top"
              type="text"
              placeholder="Enter Title"
              onChange={(e) => setFormTitle(e.target.value)}
            />
            <div className="m-2 px-2">
              <p className="my-1" style={{ color: "gray", fontSize: "24px" }}>
                Enter Description
              </p>
              <TextEditor
                onContentChange={(content) => setFormDescription(content)}
              />
            </div>
          </div>
          {fields.map((field) => renderField(field))}
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
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                />
                <div className="grid-btn">
                  <Button
                    className="field-btn"
                    variant={
                      fieldType === "paragraph"
                        ? "primary"
                        : "outline-secondary"
                    }
                    onClick={() => setFieldType("paragraph")}
                  >
                    <ImParagraphCenter size={isMobile ? 15 : 25} />
                    <div> Paragraph Text</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      fieldType === "multipleChoice"
                        ? "primary"
                        : "outline-secondary"
                    }
                    onClick={() => setFieldType("multipleChoice")}
                  >
                    <RiCheckboxMultipleBlankLine size={isMobile ? 15 : 30} />
                    <div> Multiple Choice</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      fieldType === "dropdown" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setFieldType("dropdown")}
                  >
                    {" "}
                    <IoIosArrowDropdown size={isMobile ? 15 : 30} />{" "}
                    <div>Dropdown</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      fieldType === "checkbox" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setFieldType("checkbox")}
                  >
                    <IoIosCheckboxOutline size={isMobile ? 15 : 30} />
                    <div>Checkbox</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      fieldType === "date" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setFieldType("date")}
                  >
                    <BsCalendarDate size={isMobile ? 15 : 30} />
                    <div>Date</div>
                  </Button>
                  {/* <Button variant={fieldType === "time" ? "primary" : "outline-secondary"} onClick={() => setFieldType("time")}>Time</Button> */}
                  <Button
                    className="field-btn"
                    variant={
                      fieldType === "file" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setFieldType("file")}
                  >
                    <MdOutlineDriveFolderUpload size={isMobile ? 15 : 35} />
                    <div>File</div>
                  </Button>
                  <Button
                    className="field-btn"
                    variant={
                      fieldType === "number" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setFieldType("number")}
                  >
                    <GoNumber size={isMobile ? 20 : 30} />
                    <div>Number</div>
                  </Button>
                </div>
                <Button
                  className="submit-button"
                  variant="primary"
                  disabled={!fieldLabel.trim()}
                  onClick={handleAddField}
                >
                  Add
                </Button>
              </div>
              {fieldType === "multipleChoice" && (
                <div className="field-options">
                  {fieldOptions.map((option, index) => (
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
              {(fieldType === "dropdown" || fieldType === "checkbox") && (
                <div className="field-options">
                  {fieldOptions.map((option, index) => (
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
              {fieldType === "file" && (
                <div className="file-field">
                  <label>File Type:</label>
                  <select
                    className="custom-select"
                    onChange={(e) => handleFileTypeChange(e.target.value)}
                    value={fileType}
                  >
                    <option disabled value="">
                      Select
                    </option>
                    <option value=".jpeg">JPEG</option>
                    <option value=".png">PNG</option>
                    <option value=".doc">DOC</option>
                    <option value=".pdf">PDF</option>
                  </select>
                  <label>File Size:</label>
                  <select
                    className="custom-select"
                    onChange={(e) => handleFileSizeChange(e.target.value)}
                    value={fileSize}
                  >
                    <option disabled value="">
                      Select
                    </option>
                    <option value="1">1 MB</option>
                    <option value="2">2 MB</option>
                    <option value="3">3 MB</option>
                    <option value="4">4 MB</option>
                    <option value="5">5 MB</option>
                  </select>
                </div>
              )}

              {fieldType === "number" && (
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
                 {numberRange === "" && <p className="error-msg">Range is required</p>} {/* Add this line */}
                </div>
  
              )}
            </div>
          )}
          <div className="add-btn-container">
            <Button
              className="add-btn"
              onClick={() => setShowInput(!showInput)}
            >
              <IoAdd size={isMobile ? 20 : 25} />
            </Button>
          </div>
          <div className="save-btn-container">
            <Button
              className="save-button"
              variant="primary"
              onClick={sendDataToServer}
            >
              Save Form
            </Button>
            <Button
              className="save-button"
              variant="primary"
              onClick={handleAddSubQuestionProceed}
            >
            Add Sub Questions
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FormComponent;
