const express = require('express');
const {
  createTransaction,
  getTransactions,
  getSummary,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .post(createTransaction)
  .get(getTransactions);

router.get('/summary', getSummary);
router.route('/:id')
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;