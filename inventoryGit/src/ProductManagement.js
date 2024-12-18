import React, { useState, useEffect } from 'react';
import { Table, Button, Container, Row, Col, Modal, Form, InputGroup, FormControl } from 'react-bootstrap';
import { Route } from 'react-router-dom';
import Login from './Login';

function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '' });
  const [productToUpdate, setProductToUpdate] = useState({ id: '', name: '', price: '', quantity: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: 'asc' });
  // const navigate = useNavigate();

  // Fetch products from backend
  useEffect(() => {
    fetch('http://localhost:4000/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
      })
      .catch(error => console.error('Error fetching products:', error));
  }, []);

  // Handle search functionality
  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query === '') {
      setFilteredProducts(products);  // Reset when search is empty
    } else {
      setFilteredProducts(products.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.price.toString().includes(query) ||
        product.quantity.toString().includes(query)
      ));
    }
  };

  // Handle sort functionality
  const handleSort = (key) => {
    const direction = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });

    const sortedProducts = [...filteredProducts].sort((a, b) => {
      if (key === 'name') {
        return direction === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }
      if (key === 'price' || key === 'quantity') {
        return direction === 'asc'
          ? a[key] - b[key]
          : b[key] - a[key];
      }
      return 0;
    });

    setFilteredProducts(sortedProducts);
  };

  // Handle add new product
  const handleAddProduct = () => {
    if( 
      newProduct.name === '' || newProduct.name === null ||
      newProduct.price === '' || newProduct.price === null ||
      newProduct.quantity === '' || newProduct.quantity === null
    )
    {
      alert("Please enter product details");
    }
    else
    {
    fetch('http://localhost:4000/products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newProduct),
    })
      .then(response => response.json())
      .then(data => {
        setProducts([...products, { ...newProduct, id: data.productId }]);
        setFilteredProducts([...filteredProducts, { ...newProduct, id: data.productId }]);
        setShowAdd(false);
        setNewProduct({ name: '', price: '', quantity: '' });
      })
      .catch(error => console.error('Error adding product:', error));
    }
  };

  // Handle update product
  const handleUpdateProduct = () => {
    if( 
      productToUpdate.name === '' || productToUpdate.name === null ||
      productToUpdate.price === '' || productToUpdate.price === null ||
      productToUpdate.quantity === '' || productToUpdate.quantity === null
    )
    {
      alert("Please enter product details");
    }
    else
    {
    fetch(`http://localhost:4000/products/${productToUpdate.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(productToUpdate),
    })
      .then(response => response.json())
      .then(() => {
        const updatedProducts = products.map(product =>
          product.id === productToUpdate.id ? productToUpdate : product
        );
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
        setShowUpdate(false);
        setProductToUpdate({ id: '', name: '', price: '', quantity: '' });
      })
      .catch(error => console.error('Error updating product:', error));
    }
  };

  // Handle delete product
  const handleDeleteProduct = (id) => {
    fetch(`http://localhost:4000/products/${id}`, {
      method: 'DELETE',
    })
      .then(response => response.json())
      .then(() => {
        setProducts(products.filter(product => product.id !== id));
        setFilteredProducts(filteredProducts.filter(product => product.id !== id));
      })
      .catch(error => console.error('Error deleting product:', error));
  };

  // Open the update modal with the product's data
  const handleShowUpdate = (product) => {
    setProductToUpdate(product);
    setShowUpdate(true);
  };

  // Logout function
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
      <h2 className="my-4">Product Management</h2>
      <Row className="mb-3 justify-content-end">
        <Col xs="auto">
          <Button variant="success" style={{ display: 'grid', direction:'revert', padding:'10px'}} onClick={() => setShowAdd(true)}>Add Product</Button>
        </Col>
      </Row>
      <Button variant="danger" style={{ position: 'fixed', top:'20px', right: '20px'}} onClick={handleLogout}>Logout</Button>
      {/* Search Input */}
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search by name, price, or quantity"
          value={searchQuery}
          onChange={handleSearch}
        />
      </InputGroup>

      {/* Product Table */}
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th onClick={() => handleSort('name')}>Name</th>
            <th onClick={() => handleSort('price')}>Price</th>
            <th onClick={() => handleSort('quantity')}>Quantity</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.quantity}</td>
              <td>
                <Button variant="warning" style={{ margin: '10px' }} onClick={() => handleShowUpdate(product)}>Update</Button>
                <Button variant="danger" onClick={() => handleDeleteProduct(product.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for adding a new product */}
      <Modal show={showAdd} onHide={() => setShowAdd(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProductName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formProductPrice" className="mt-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter product price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formProductQuantity" className="mt-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                placeholder="Enter product quantity"
                value={newProduct.quantity}
                onChange={(e) => setNewProduct({ ...newProduct, quantity: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAdd(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddProduct}>
            Add Product
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for updating a product */}
      <Modal show={showUpdate} onHide={() => setShowUpdate(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Update Product</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formProductName">
              <Form.Label>Product Name</Form.Label>
              <Form.Control
                type="text"
                value={productToUpdate.name}
                onChange={(e) => setProductToUpdate({ ...productToUpdate, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formProductPrice" className="mt-3">
              <Form.Label>Price</Form.Label>
              <Form.Control
                type="number"
                value={productToUpdate.price}
                onChange={(e) => setProductToUpdate({ ...productToUpdate, price: e.target.value })}
              />
            </Form.Group>
            <Form.Group controlId="formProductQuantity" className="mt-3">
              <Form.Label>Quantity</Form.Label>
              <Form.Control
                type="number"
                value={productToUpdate.quantity}
                onChange={(e) => setProductToUpdate({ ...productToUpdate, quantity: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdate(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleUpdateProduct}>
            Update Product
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default ProductManagement;
