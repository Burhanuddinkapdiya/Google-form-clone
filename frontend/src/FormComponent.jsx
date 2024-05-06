import { useState } from "react";
import { Button, Container, Row, Col } from "react-bootstrap";
import { ImParagraphCenter } from "react-icons/im";
import { IoIosArrowDropdown } from "react-icons/io";
import { IoIosCheckboxOutline } from "react-icons/io";
import { BsCalendarDate } from "react-icons/bs";
import { RiCheckboxMultipleBlankLine } from "react-icons/ri";
import { BsImage } from "react-icons/bs";
import { MdDeleteOutline } from "react-icons/md"; 
import { FaRegCopy } from "react-icons/fa";
import "./FormComponent.css"; // Import the CSS file

const FormComponent = () => {
  const [fields, setFields] = useState([]);
  const [fieldType, setFieldType] = useState("");
  const [fieldLabel, setFieldLabel] = useState("");
  const [fieldOptions, setFieldOptions] = useState([]);
  const [fieldCounter, setFieldCounter] = useState(0);
  const [showInput, setShowInput] = useState(false);
  const [optionError, setOptionError] = useState(false);

  const handleAddField = () => {
    if(fieldType === 'paragraph'){
      setFields([
        ...fields,
        {
          id: fieldCounter,
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
    }
    if (fieldOptions.length === 0) {
      setOptionError(true);
      return; // Exit the function early if options are not present
    }
    setFields([
      ...fields,
      {
        id: fieldCounter,
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
  };

  const handleAddOption = () => {
    setFieldOptions([...fieldOptions, ""]);
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

  const renderField = (field) => {
    return (
      <div className="box" key={field.id}>
        <h4>{field.label}</h4>
        {field.type === "paragraph" && (
          <input className="custom-input" type="text" placeholder="Paragraph" />
        )}
        {field.type === "multipleChoice" &&
          field.options.map((option, optionIndex) => (
            <div className="options" key={optionIndex}>
              <input
                className="custom-input"
                type="radio"
                name={`option_${field.id}`}
                value={option}
              />{" "}
              {option}
              <Button
                className="btn-close"
                size="sm"
                onClick={() => handleDeleteOption(field.id, optionIndex)}
              ></Button>
            </div>
          ))}
        {field.type === "dropdown" && (
          <select className="custom-select">
            {field.options.map((option, optionIndex) => (
              <option key={optionIndex}>{option}</option>
            ))}
          </select>
        )}
        {field.type === "checkbox" &&
          field.options.map((option, optionIndex) => (
            <div className="options" key={optionIndex}>
              <input
                className="custom-checkbox"
                type="checkbox"
                id={`option_${optionIndex}`}
                name={`option_${field.id}`}
                value={option}
              />
              <label htmlFor={`option_${optionIndex}`}>{option}</label>
              <Button
                className="btn-close"
                size="sm"
                onClick={() => handleDeleteOption(field.id, optionIndex)}
              ></Button>
            </div>
          ))}
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
            size="sm"
            onClick={() => handleDeleteField(field.id)}
          ><MdDeleteOutline size={25} /></Button>
          <Button
            className="btn-copy"
            size="sm"
            onClick={() => handleDuplicateField(field.id)}
          ><FaRegCopy size={25} />
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
              className="custom-input custom-input-top"
              type="text"
              placeholder="Enter Title"
            />
            <input
              className="custom-input"
              type="text"
              placeholder="Enter Description"
            />
          </div>

          {fields.map((field) => renderField(field))}
          {showInput && (
            <div className="box">
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
                    variant={
                      fieldType === "paragraph"
                        ? "primary"
                        : "outline-secondary"
                    }
                    onClick={() => setFieldType("paragraph")}
                  >
                    <ImParagraphCenter size={20} />
                    <div> Paragraph Text</div>
                  </Button>
                  <Button
                    variant={
                      fieldType === "multipleChoice"
                        ? "primary"
                        : "outline-secondary"
                    }
                    onClick={() => setFieldType("multipleChoice")}
                  >
                    <RiCheckboxMultipleBlankLine size={30} />
                    <div> Multiple Choice</div>
                  </Button>
                  <Button
                    variant={
                      fieldType === "dropdown" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setFieldType("dropdown")}
                  >
                    {" "}
                    <IoIosArrowDropdown size={30} /> <div>Dropdown</div>
                  </Button>
                  <Button
                    variant={
                      fieldType === "checkbox" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setFieldType("checkbox")}
                  >
                    <IoIosCheckboxOutline size={30} />
                    <div>Checkbox</div>
                  </Button>
                  <Button
                    variant={
                      fieldType === "date" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setFieldType("date")}
                  >
                    <BsCalendarDate size={25} />
                    <div>Date</div>
                  </Button>
                  {/* <Button variant={fieldType === "time" ? "primary" : "outline-secondary"} onClick={() => setFieldType("time")}>Time</Button> */}
                  <Button
                    variant={
                      fieldType === "image" ? "primary" : "outline-secondary"
                    }
                    onClick={() => setFieldType("image")}
                  >
                    <BsImage size={25} />
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
                    <input
                      key={index}
                      className="custom-input"
                      type="text"
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                    />
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
        </Col>
      </Row>
    </Container>
  );
};

export default FormComponent;
