import { useEffect, useState } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { ImParagraphCenter } from "react-icons/im";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoIosCheckboxOutline } from "react-icons/io";
import { BsCalendarDate } from "react-icons/bs";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import { BsImage } from "react-icons/bs";
import { MdDeleteOutline } from "react-icons/md";
import { FaRegCopy } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import "./FormComponent.css"; // Import the CSS file

const FormComponent = () => {
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
      fieldType === "image"
    ) {
      setFields((prevFields) => [
        ...prevFields.filter((field) => field.id !== editingFieldId),
        {
          id: editingFieldId !== null ? editingFieldId : fieldCounter,
          type: fieldType,
          label: fieldLabel,
          options: [...fieldOptions.filter((option) => option.trim() !== "")],
        },
      ]);
      setFieldCounter(fieldCounter + 1);
      setFieldType("");
      setFieldLabel("");
      setFieldOptions([]);
      setShowInput(!showInput);
      setOptionError(false);
      setEditingFieldId(null);
    } else if (
      fieldOptions.length === 0 ||
      fieldOptions.some((option) => option.trim() === "")
    ) {
      setOptionError(true);
      return; // Exit the function early if options are not present or contains empty options
    } else {
      setFields((prevFields) => [
        ...prevFields.filter((field) => field.id !== editingFieldId),
        {
          id: editingFieldId !== null ? editingFieldId : fieldCounter,
          type: fieldType,
          label: fieldLabel,
          options: [...fieldOptions],
        },
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
  const handleDeleteOption = (fieldId, optionIndex) => {
    const updatedFields = fields.map((field) => {
      if (field.id === fieldId) {
        const updatedOptions = [...field.options];
        updatedOptions.splice(optionIndex, 1);
        return { ...field, options: updatedOptions };
      }
      return field;
    });
    setFields(updatedFields);
  };

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
        fields: fields.map((field) => ({
          id: field.id,
          type: field.type,
          label: field.label,
          options: field.options,
          required: field.required || false,
        })),
      };
  
      // Send the formData to the server
      // const response = await fetch("http://localhost:3001/saveFormData", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(formData),
      // });
  
      // if (!response.ok) {
      //   throw new Error("Failed to save form data");
      // }
      const data = await formData;
      console.log(data)
  
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
  
      console.log("Form data saved successfully");
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
  

  const renderField = (field) => {
    return (
      <div className="box" key={field.id}>
        <h4>{field.label}</h4>
        {field.type === "paragraph" && (
          <input className="custom-input" type="text" placeholder="Paragraph" />
        )}
        {field.type === "multipleChoice" && (
          <div>
            {field.options.map((option, optionIndex) => (
              <div className="options" key={optionIndex}>
                <input
                  type="radio"
                  name={`option_${field.id}`}
                  value={option}
                />
                {option}
                <Button
                  className="btn-close btn-outline-light"
                  size="sm"
                  onClick={() => handleDeleteOption(field.id, optionIndex)}
                ></Button>
              </div>
            ))}
          </div>
        )}
        {field.type === "dropdown" && (
          <select className="custom-select">
            {field.options.map((option, optionIndex) => (
              <option key={optionIndex}>{option}</option>
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
          <input className="custom-input" type="date" />
        )}
        {field.type === "time" && (
          <input className="custom-input" type="time" />
        )}
        {field.type === "image" && (
          <div>
            <input className="custom-input" type="file" accept="image/*" />
            <img src={field.imageSrc} />
          </div>
        )}
        <div className="footer">
          <Button
            title="Delete"
            className="btn-delete"
            size="sm"
            onClick={() => handleDeleteField(field.id)}
          >
            <MdDeleteOutline size={isMobile?20:30} />
          </Button>
          <Button
            title="Edit"
            className="btn-edit"
            size="sm"
            onClick={() => handleEditOptions(field.id)}
          >
            <FaRegEdit size={isMobile?15:25} />
          </Button>
          <Button
            title="Copy"
            className="btn-copy"
            size="sm"
            onClick={() => handleDuplicateField(field.id)}
          >
            <FaRegCopy size={isMobile?15:25} />
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
              checked={field.required}
              onChange={() => handleToggleRequired(field.id)}
            />
          </div>
        </div>
      </div>
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
            <input
              value={formDescription}
              className="custom-input"
              type="text"
              placeholder="Enter Description"
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          {fields.map((field) => renderField(field))}
          {showInput && (
            <div className="box">
              <div className="btn-close-top">
              <Button
                        className="btn-close btn-outline-light "
                        size="sm"
                        onClick={() => setShowInput(!showInput) }
                      ></Button></div>
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
                    <IoIosArrowDropdown size={isMobile ? 15 : 30}/> <div>Dropdown</div>
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
                      fieldType === "image" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setFieldType("image")}
                  >
                    <BsImage size={isMobile ? 15 : 30} />
                    <div>Image</div>
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
              {(fieldType === "multipleChoice" ||
                fieldType === "dropdown" ||
                fieldType === "checkbox") && (
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
            </div>
          )}
          <div className="add-btn-container">
            <button
              className="round-button"
              onClick={() => setShowInput(!showInput)}
            >
              +
            </button>
          </div>
          <div className="add-btn-container">
            <Button
              className="save-button"
              variant="primary"
              onClick={sendDataToServer}
            >
              Save
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default FormComponent;
