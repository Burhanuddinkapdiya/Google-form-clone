import { Container, Row, Col } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import "./SuccessPage.css";

const SuccessPage = () => {
  return (
    <Container>
      <Row>
        <Col>
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <h1>Form Submitted Successfully!</h1>
            <h5>Thank you for your submission.</h5>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SuccessPage;
