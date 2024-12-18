import 'bootstrap/dist/css/bootstrap.min.css';  // Import Bootstrap CSS globally
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import './index.css'; // If you have custom styles

// Components
import Login from './Login';
import ProductManagement from './ProductManagement';
import Billing from './Billing';


// App Component to handle routing
function App() {
  const role = localStorage.getItem('role');


  return (
    <Router>
      <div className="App">
        <h1 className="text-center my-4">Inventory Management System</h1>
        <Routes>
          {/* <Route path="/" element={<Login />} /> */}
          <Route
            path="/"
            element={role ? <Navigate to={`/${role}`} /> : (<><Login /><Login /></>)} 
          />
          {role === 'manager' ? (
            <>
            <Route path="/manager" element={<ProductManagement />} />
            <Route path="/manager" element={<ProductManagement />} />
            </>
            ) : (
              <Route path="/manager" element={<Navigate to="/" />} /> // Redirect to login if no role
            )}
          {role === 'billPerson' ? (
            <>
            <Route path="/billPerson" element={<Billing />} />
            <Route path="/billPerson" element={<Billing />} />
            </>
          ) : (
            <Route path="/billPerson" element={<Navigate to="/" />} /> // Redirect to login if no role
          )
            }
        </Routes>
      </div>
    </Router>
  );
}

// render with `createRoot`
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
