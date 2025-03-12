import styled from "styled-components";

const ErrorContainer = styled.div`
  padding: 20px;
  margin: 20px 0;
  background-color: #fff3f3;
  border: 1px solid #ffcdd2;
  border-radius: 8px;
  text-align: center;
  color: #d32f2f;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h3 {
    margin: 0 0 10px;
    font-size: 1.2rem;
  }

  p {
    margin: 0;
    font-size: 1rem;
  }
`;

interface ErrorFallbackProps {
  error: string | null;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error }) => (
  <ErrorContainer>
    <h3>Oops! Something went wrong</h3>
    <p>{error}</p>
  </ErrorContainer>
);
