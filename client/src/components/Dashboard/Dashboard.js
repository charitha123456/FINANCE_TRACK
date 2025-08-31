import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import ExpenseChart from '../Charts/ExpenseChart';
import MonthlyChart from '../Charts/MonthlyChart';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryResponse, transactionsResponse] = await Promise.all([
        api.get('/transactions/summary'),
        api.get('/transactions?limit=5')
      ]);
      
      setSummary(summaryResponse.data);
      setRecentTransactions(transactionsResponse.data.transactions);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <Link to="/transactions/new" className="btn-primary">
          Add Transaction
        </Link>
      </div>

      {summary && (
        <div className="summary-cards">
          <div className="summary-card income">
            <h3>Total Income</h3>
            <p>${summary.totalIncome.toFixed(2)}</p>
          </div>
          <div className="summary-card expense">
            <h3>Total Expenses</h3>
            <p>${summary.totalExpense.toFixed(2)}</p>
          </div>
          <div className="summary-card balance">
            <h3>Balance</h3>
            <p>${(summary.totalIncome - summary.totalExpense).toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="charts-container">
        <div className="chart">
          <h3>Expenses by Category</h3>
          <ExpenseChart data={summary?.expensesByCategory} />
        </div>
        <div className="chart">
          <h3>Income vs Expenses</h3>
          <MonthlyChart data={summary?.monthlyData} />
        </div>
      </div>

      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        {recentTransactions.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Description</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(transaction => (
                <tr key={transaction._id}>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{transaction.description}</td>
                  <td>{transaction.category}</td>
                  <td className={transaction.type === 'income' ? 'amount-income' : 'amount-expense'}>
                    {transaction.type === 'income' ? '+' : '-'}${Math.abs(transaction.amount).toFixed(2)}
                  </td>
                  <td>
                    <span className={`type-badge ${transaction.type}`}>
                      {transaction.type}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No transactions yet. <Link to="/transactions/new">Add your first transaction</Link></p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;