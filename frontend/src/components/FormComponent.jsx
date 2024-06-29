import { useEffect, useState,useRef} from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
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
import { useNavigate } from "react-router-dom";
import parse from "html-react-parser";

const FormComponent = () => {
  const navigate = useNavigate();
  const inputFormRef = useRef(null);
  const [formId, setFormId] = useState("");
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
  const [parentQuestionId, setParentQuestionId] = useState(null);
  const [parentOptionValue, setParentOptionValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);



  const saveSurvey = async () => {
    try {
      const formData = {
        title: formTitle,
        description: formDescription,
        // fields: fields.map((field) => {
        //   return {
        //     id: field.id,
        //     type: field.type,
        //     label: field.label,
        //     options: field.options,
        //     p_q_id: field.p_q_id !== undefined ? field.p_q_id : null,
        //     on_value: field.on_value !== undefined ? field.on_value : null,
        //   };
        // }),
      };
      console.log(formData);

      if(!formData.title || !formData.description){
        alert("Please Fill The Following Fields!!");
        return;
      }

      
      const response = await fetch("http://localhost:3001/saveSurvey", {
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
      setFormId(responseData.formId);
      setShowInput(true);
      console.log("Form data saved successfully", formId);


    } catch (error) {
      console.error("Error:", error.message);
      navigate("/error", {
        state: { message: "Failed to save the form. Please try again later." },
      });
    }
  };
  const handleSaveForm = ()=>{
    navigate("/success", {
      state: { message: "Survey Created" , url:`http://localhost:5713/survey/${formId}/ITSID` },
    });
  }
  
  
  const handleDeleteForm = async (formId) => {
    try {
      console.log(formId)
      const response = await fetch(`http://localhost:3001/deleteForm/${formId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // If the delete request was successful
        navigate("/success", {
          state: { message: "Form Deleted Successfully" },
        });
        
      } else {
        
        const errorData = await response.json();
        navigate("/error", {
        state: { message: errorData.message },
      });
      }
    } catch (error) {
      console.error('Error deleting form:', error);
      navigate("/error", {
        state: { message: "An error occurred while deleting the form. Please try again later." }},
      )
    }
  };

  const saveSingleQuestion = async (question) => {
    try {
      const response = await fetch("http://localhost:3001/saveQuestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(question),
      });

      if (!response.ok) {
        throw new Error("Failed to save question");
      }

      const responseData = await response.json();
      question.id = responseData.questionId;

      setFields((prevFields) => [
        ...prevFields.filter((field) => field.id !== editingFieldId),
        question,
      ]);
      setFieldCounter((prevCounter) => prevCounter + 1);

      console.log("Question saved successfully", question);
    } catch (error) {
      console.error("Error:", error.message);
      navigate("/error", {
        state: { message: "Failed to save the question. Please try again later." },
      });
    }
  };
  const updateQuestion = async (questionId, updatedData) => {
    try {
      const response = await fetch(`http://localhost:3001/updateQuestion/${questionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        throw new Error("Failed to update question");
      }

      const updatedFields = fields.map((field) => (field.id === questionId ? updatedData : field));
      setFields(updatedFields);

      console.log("Question updated successfully", updatedData);
    } catch (error) {
      console.error("Error:", error.message);
      navigate("/error", {
        state: { message: "Failed to update the question. Please try again later." },
      });
    }
  };

  const deleteQuestion = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/deleteQuestion/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      setFields(fields.filter((field) => field.id !== id));
      console.log("Question deleted successfully", id);
    } catch (error) {
      console.error("Error:", error.message);
      navigate("/error", {
        state: { message: "Failed to delete the question. Please try again later." },
      });
    }
  };


  const handleAddSubQuestion = (id, option) => {
    if (inputFormRef.current) {
      inputFormRef.current.scrollIntoView({ behavior: "smooth" });
    }
    setParentQuestionId(id);
    setParentOptionValue(option);
    setShowInput(true);
  };

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
 

  const handleDeleteField = (id) => {
    deleteQuestion(id); // Call the deleteQuestion function to delete the question from the server
  };

  const handleAddField = () => {
    
    if (fieldType === "paragraph" || fieldType === "date" || fieldType === "file" || fieldType === "number") {
      if (fieldType === "number" && !numberRange) {
        return;
      }
      const newField = {
        s_id: formId,
        id: editingFieldId !== null ? editingFieldId : fieldCounter,
        type: fieldType,
        label: fieldLabel,
        options: fieldType === "number" ? [numberRange] : [...fieldOptions.filter((option) => option.trim() !== "")],
        p_q_id: parentQuestionId || null, // Default to null for parent fields
        on_value: parentOptionValue || null, // Default to null for parent fields
      };

      if (editingFieldId !== null) {

        updateQuestion(editingFieldId, newField); // Pass editingFieldId to updateQuestion function
      } else {
        saveSingleQuestion(newField); // Call the saveSingleQuestion function to save a new question
      }

      setFieldType("");
      setFieldLabel("");
      setFieldOptions([]);
      setShowInput(!showInput);
      setOptionError(false);
      setEditingFieldId(null);
      setNumberRange("");
      setParentQuestionId(null);
      setParentOptionValue("");
      setIsEditing(false);
    } else if (fieldOptions.length === 0 || fieldOptions.some((option) => option.trim() === "")) {
      setOptionError(true);
      return; // Exit the function early if options are not present or contain empty options
    } else {
      const newField = {
        s_id: formId,
        id: editingFieldId !== null ? editingFieldId : fieldCounter,
        type: fieldType,
        label: fieldLabel,
        options: [...fieldOptions],
        p_q_id: parentQuestionId || null, // Default to null for parent fields
        on_value: parentOptionValue || null, // Default to null for parent fields
      };

      if (editingFieldId !== null) {
        updateQuestion(editingFieldId, newField); // Pass editingFieldId to updateQuestion function
      } else {
        saveSingleQuestion(newField); // Call the saveSingleQuestion function to save a new question
      }

      setFieldType("");
      setFieldLabel("");
      setFieldOptions([]);
      setShowInput(!showInput);
      setOptionError(false);
      setEditingFieldId(null);
      setParentOptionValue("");
      setParentQuestionId("");
      setIsEditing(false);

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


  const handleDuplicateField = (id) => {
    const fieldToDuplicate = fields.find((field) => field.id === id);
    const duplicatedField = { ...fieldToDuplicate, id: fieldCounter };
    saveSingleQuestion(duplicatedField);
    setFieldCounter(fieldCounter + 1);
  };

  const handleToggleRequired = async (id) => {
    const updatedFields = fields.map((field) => {
      if (field.id === id) {
        return { ...field, required: !field.required };
      }
      return field;
    });
  
    const updatedField = updatedFields.find((field) => field.id === id);
    if (updatedField) {
      await updateQuestion(id, updatedField);
    }
    setFields(updatedFields);
  };
  
  const handleEditOptions = (fieldId) => {
  setIsEditing(true);
  if (inputFormRef.current) {
    inputFormRef.current.scrollIntoView({ behavior: "smooth" });
  }
    setEditingFieldId(fieldId);
    const field = fields.find((field) => field.id === fieldId);
    setFieldLabel(field.label);
    setFieldType(field.type);
    setFieldOptions([...field.options]);
    setParentOptionValue(field.on_value);
    setParentQuestionId(field.p_q_id);
    setShowInput(true);
  };
  


  const renderField = (field) => {
    const subQuestions = fields.filter((subField) => subField.p_q_id === field.id);
    return (
      <div className={!field.p_q_id ? "box" : "subQuestion"} key={field.id} style={{ order: field.id }}>
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
                <Button
                  className="add-btn"
                  size="xs"
                  onClick={() => handleAddSubQuestion(field.id, option)}
                >
                 <IoAdd size={isMobile ? 20 : 25} />
                </Button>
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
        {subQuestions.map((subField) =><div
          key={subField.id}
        >
          {renderField(subField)}
        </div>)}
      </div>
    );
  };
  
  
  
  
  return (
    <Container className="form-container">
      <Row>
        <Col>{!formId ? <>
          <div className="box-top">
            <input
              value={formTitle}
              className="custom-input custom-input-top"
              type="text"
              placeholder="Enter Title"
              onChange={(e) => setFormTitle(e.target.value)}
            />
            <div className="m-2 px-2">
              <TextEditor
                onContentChange={(content) => setFormDescription(content)}
              />
            </div>
           
          </div>
          <Button
              className="save-button d-flex m-auto my-3"
              variant="primary"
              onClick={saveSurvey}
            >
              Add Questions
            </Button></> : <div className="box-top">
                <h1>{formTitle}</h1>
                <div className="description">{parse(formDescription)}</div>
              </div> }
            
           {fields
      .filter((field) => !field.p_q_id)
      .map((field) => renderField(field))
  }
          {showInput && (
            <div className="box" ref={inputFormRef}>
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
                 {!isEditing ? "Add" : "Update"}
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
                  {numberRange === "" && (
                    <p className="error-msg">Range is required</p>
                  )}{" "}
                  {/* Add this line */}
                </div>
              )}
            </div>
          )}
          <div className="add-btn-container">
            
            {formId ? <Button
              className="btn btn-danger"
              variant="btn-danger"
              onClick={()=>handleDeleteForm(formId)}
            >
              Delete
            </Button>:""}
            {formId ? <Button
              className="add-btn"
              onClick={() => setShowInput(!showInput)}
            >
              <IoAdd size={isMobile ? 20 : 25} />
            </Button>:""}
            {formId ? <Button
              className="save-button"
              variant="primary"
              onClick={handleSaveForm}
            >
              Save Survey
            </Button>:""}
          </div>
          {/* <div className="save-btn-container">
            {formId ? <Button
              className="btn btn-danger"
              variant="btn-danger"
              onClick={handleDeleteForm}
            >
              Delete Form
            </Button>:""}
            {fields.length ? <Button
              className="save-button"
              variant="primary"
              onClick={handleSaveForm}
            >
              Save Form
            </Button>:""}
            
          </div> */}
        </Col>
      </Row>
    </Container>
  );
};

export default FormComponent;
