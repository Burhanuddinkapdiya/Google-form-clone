import { Container, Row, Col } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import "./SuccessPage.css";
import { useLocation } from "react-router-dom";

const SuccessPage = () => {

  const location = useLocation();
  const { state } = location;
  const message = state?.message || 'An error occurred.';

  return (
    <Container>
      <Row>
        <Col>
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <h1>{message}</h1>
            <h5>Thank you for your submission.</h5>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SuccessPage;
