import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Alert } from 'react-bootstrap';
import { Route } from 'react-router-dom';
import Login from './Login';

function Billing() {
  const [products, setProducts] = useState([]); // Will hold products fetched from the backend
  const [selectedProducts, setSelectedProducts] = useState([]); // Selected products for billing
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  // const navigate = useNavigate();
  // Fetch products from the backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('token'); // Get the token from local storage
        const response = await fetch('http://localhost:4000/products', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`, // Pass token for authentication
          },
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data); // Set the fetched products into state
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        setError('An error occurred while fetching products');
      }
    };

    fetchProducts();
  }, []);

  // Handle billing of a selected product
  const handleBill = async (product, quantity) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:4000/bill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity }),
      });

      const data = await response.json();

      if (response.ok) {
        setSelectedProducts([...selectedProducts, { ...product, quantity }]); // Add product with quantity to selected products
        setSuccess('Product billed successfully!');
        setError(null);
      } else {
        setError(data.message);
        setSuccess(null);
      }
    } catch (err) {
      setError('An error occurred while billing the product');
      setSuccess(null);
    }
  };

  // Calculate total price by multiplying price by quantity for each product
  const calculateTotal = () => {
    return selectedProducts.reduce((total, product) => total + product.price * product.quantity, 0);
  };

  const handleLogout = () => {
    // Remove the JWT token from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('role');

    // Redirect to the login page
    // navigate('/');
    <Route path="/" element={<Login />} />
    window.location.reload();
  };

  return (
    <Container>
      <h2 className="my-4">Billing</h2>
      <Button variant="danger" style={{ position: 'fixed', top:'20px', right: '20px'}} onClick={handleLogout}>Logout</Button>

      {/* Show success or error message */}
      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.quantity}</td>
              <td>
                <Button
                  variant="primary"
                  onClick={() => {
                    const quantity = prompt(`Enter quantity to bill for ${product.name}:`);
                    if (quantity && !isNaN(quantity) && quantity > 0 && quantity <= product.quantity) {
                      handleBill(product, parseInt(quantity));
                    } else {
                      alert('Invalid quantity or insufficient stock');
                    }
                  }}
                >
                  Bill
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h4>Total: ${calculateTotal().toFixed(2)}</h4>
    </Container>
  );
}

export default Billing;
