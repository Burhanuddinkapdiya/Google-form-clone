import { Container, Row, Col } from "react-bootstrap";
import { FaCheckCircle } from "react-icons/fa";
import "./SuccessPage.css";
import { Link, useLocation } from "react-router-dom";

const SuccessPage = () => {

  const location = useLocation();
  const { state } = location;
  const message = state?.message || 'An error occurred.';
  const url = state?.url ;

  return (
    <Container>
      <Row>
        <Col>
          <div className="success-message">
            <FaCheckCircle className="success-icon" />
            <h1>{message}</h1>
            
            {url ? <Link to={url}>{url}</Link> : <p>Thank You For Submission</p>}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default SuccessPage;
