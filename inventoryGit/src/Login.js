import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Container, Row, Col } from 'react-bootstrap';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // remove token
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Send login request to the server
    fetch('http://localhost:4000/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('role', username); // This could be extracted from the token
          if(username === 'manager')
          {
            navigate('/manager');
          }

          else if( username === 'billPerson')
          {
            navigate('/billPerson');
          }
          window.location.reload();
        } else {
          alert('Invalid credentials');
        }
      })
      .catch((err) => {
        alert('Error during login');
        console.error(err);
      });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '70vh' }}>
      <Row>
        <Col md={15}>
          <h2 className="text-center">Login</h2>
          <Form onSubmit={handleSubmit} className="mt-4">
            <Form.Group controlId="formUsername">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group controlId="formPassword" className="mt-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3 w-100">
              Login
            </Button>
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
