import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const TransactionForm = () => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      fetchTransaction();
    }
  }, [id]);

  const fetchTransaction = async () => {
    try {
      const response = await api.get(`/transactions`);
      const transaction = response.data.transactions.find(t => t._id === id);
      
      if (transaction) {
        setFormData({
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          date: new Date(transaction.date).toISOString().split('T')[0],
        });
      }
    } catch (error) {
      console.error('Error fetching transaction:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      if (id) {
        await api.put(`/transactions/${id}`, formData);
      } else {
        await api.post('/transactions', formData);
      }
      
      navigate('/transactions');
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving transaction');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Food', 'Transportation', 'Entertainment', 'Shopping', 
    'Utilities', 'Healthcare', 'Education', 'Other'
  ];

  return (
    <div className="transaction-form">
      <h2>{id ? 'Edit' : 'Add'} Transaction</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Type</label>
          <select name="type" value={formData.type} onChange={handleChange} required>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </div>
        
        <div className="form-group">
          <label>Amount</label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            step="0.01"
            min="0"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Category</label>
          <select name="category" value={formData.category} onChange={handleChange} required>
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (id ? 'Update' : 'Add')} Transaction
        </button>
        
        <button 
          type="button" 
          onClick={() => navigate('/transactions')}
          className="btn-secondary"
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;