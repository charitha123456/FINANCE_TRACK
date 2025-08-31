const Transaction = require('../models/Transaction');

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { type, amount, category, description, date } = req.body;
    
    // Validation
    if (!type || !amount || !category || !description) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }
    
    if (amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    if (!['income', 'expense'].includes(type)) {
      return res.status(400).json({ message: 'Type must be either income or expense' });
    }

    const transaction = new Transaction({
      user: req.user._id,
      type,
      amount: parseFloat(amount),
      category: category.trim(),
      description: description.trim(),
      date: date ? new Date(date) : new Date(),
    });

    const createdTransaction = await transaction.save();
    res.status(201).json(createdTransaction);
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ message: 'Server error creating transaction' });
  }
};

// Get all transactions for a user with optional filters
exports.getTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, startDate, endDate, type, category } = req.query;
    
    const query = { user: req.user._id };
    
    // Date filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    // Type filter
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }
    
    // Category filter
    if (category) {
      query.category = new RegExp(category, 'i'); // Case-insensitive search
    }
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { date: -1, createdAt: -1 }
    };
    
    const transactions = await Transaction.find(query)
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit);
    
    const total = await Transaction.countDocuments(query);
    
    res.json({
      transactions,
      totalPages: Math.ceil(total / options.limit),
      currentPage: options.page,
      total,
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'Server error fetching transactions' });
  }
};

// Get transaction summary (for charts)
exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { user: req.user._id };
    
    // Date filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const transactions = await Transaction.find(query);
    
    // Calculate expenses by category
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, transaction) => {
        acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
        return acc;
      }, {});
    
    // Calculate income vs expenses over time (monthly)
    const monthlyData = transactions.reduce((acc, transaction) => {
      const month = transaction.date.toISOString().substring(0, 7); // YYYY-MM format
      if (!acc[month]) {
        acc[month] = { income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        acc[month].income += transaction.amount;
      } else {
        acc[month].expense += transaction.amount;
      }
      
      return acc;
    }, {});
    
    res.json({
      expensesByCategory,
      monthlyData,
      totalIncome: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpense: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
    });
  } catch (error) {
    console.error('Get summary error:', error);
    res.status(500).json({ message: 'Server error fetching summary' });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check if user owns the transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to update this transaction' });
    }
    
    const { type, amount, category, description, date } = req.body;
    
    // Validation
    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }
    
    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id,
      {
        ...(type && { type }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(category && { category: category.trim() }),
        ...(description && { description: description.trim() }),
        ...(date && { date: new Date(date) }),
      },
      { new: true, runValidators: true }
    );
    
    res.json(updatedTransaction);
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ message: 'Server error updating transaction' });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    // Check if user owns the transaction
    if (transaction.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to delete this transaction' });
    }
    
    await Transaction.findByIdAndDelete(id);
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ message: 'Server error deleting transaction' });
  }
};