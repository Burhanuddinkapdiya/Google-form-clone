import { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import PropTypes from "prop-types";

const SubQuestionModal = ({ show, handleClose, addSubQuestion }) => {
  const [subQuestionLabel, setSubQuestionLabel] = useState("");

  const handleSaveSubQuestion = () => {
    addSubQuestion(subQuestionLabel);
    setSubQuestionLabel("");
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add Sub Question</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group>
            <Form.Label>Sub Question</Form.Label>
            <Form.Control
              type="text"
              value={subQuestionLabel}
              onChange={(e) => setSubQuestionLabel(e.target.value)}
              placeholder="Enter sub question"
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSaveSubQuestion}>
          Save Sub Question
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
SubQuestionModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    addSubQuestion: PropTypes.func.isRequired,
  };

export default SubQuestionModal;
