import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import TransactionList from './components/Transactions/TransactionList';
import TransactionForm from './components/Transactions/TransactionForm';
import UploadForm from './components/Upload/UploadForm';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar />}
        <div className="container">
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/login" 
              element={!user ? <Login /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/register" 
              element={!user ? <Register /> : <Navigate to="/dashboard" />} 
            />
            <Route 
              path="/dashboard" 
              element={user ? <Dashboard /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/transactions" 
              element={user ? <TransactionList /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/transactions/new" 
              element={user ? <TransactionForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/transactions/edit/:id" 
              element={user ? <TransactionForm /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/upload" 
              element={user ? <UploadForm /> : <Navigate to="/login" />} 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;