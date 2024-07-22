import { Container, Row, Col } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';
import './ErrorPage.css'; // Import the CSS file

const ErrorPage = () => {
  const location = useLocation();
  const { state } = location;
  const message = state?.message || 'An error occurred.';

  return (
    <Container>
      <Row>
        <Col>
          <div className="error-message">
            <FaExclamationTriangle className="error-icon" />
            <h1>{message}</h1>
            <p>Please try again later.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ErrorPage;
