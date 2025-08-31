const fs = require('fs');
const path = require('path');
const { extractTextFromImage, parseReceiptText } = require('../utils/ocrProcessor');
const { parsePDF, extractTransactionsFromText } = require('../utils/pdfParser');
const Transaction = require('../models/Transaction'); // ADD THIS IMPORT

// Process receipt image
exports.processReceipt = async (req, res) => {
  try {
    console.log('File upload attempt:', req.file);
    
    if (!req.file) {
      console.log('No file received in request');
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    console.log('File saved at:', filePath);
    
    // Extract text from image using OCR
    const text = await extractTextFromImage(filePath);
    
    // Parse the extracted text to get transaction details
    const transactionData = parseReceiptText(text);
    console.log('Parsed transaction data:', transactionData);
    
    // If amount was extracted, create the transaction automatically
    let createdTransaction = null;
    if (transactionData.amount && !isNaN(transactionData.amount)) {
      try {
        const transaction = new Transaction({
          user: req.user._id,
          type: 'expense',
          amount: transactionData.amount,
          category: transactionData.category,
          description: transactionData.description,
          date: transactionData.date,
        });
        
        createdTransaction = await transaction.save();
        console.log('Transaction created successfully:', createdTransaction);
      } catch (saveError) {
        console.error('Error saving transaction:', saveError);
      }
    } else {
      console.log('No valid amount extracted from receipt');
    }
    
    // Clean up the uploaded file
    try {
      fs.unlinkSync(filePath);
      console.log('Temporary file deleted');
    } catch (unlinkError) {
      console.warn('Could not delete uploaded file:', unlinkError);
    }
    
    res.json({
      message: 'Receipt processed successfully',
      text: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
      transaction: transactionData,
      createdTransaction: createdTransaction
    });
    
  } catch (error) {
    console.error('Process receipt error details:', error);
    
    // Clean up file on error
    if (req.file) {
      try {
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.warn('Could not delete uploaded file on error:', unlinkError);
      }
    }
    
    res.status(500).json({ 
      message: 'Error processing receipt',
      error: error.message 
    });
  }
};

// Process PDF statement
exports.processPDF = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const filePath = path.join(__dirname, '../uploads', req.file.filename);
    const dataBuffer = fs.readFileSync(filePath);
    
    // Extract text from PDF
    const text = await parsePDF(dataBuffer);
    
    // Parse the extracted text to get transactions
    const transactions = extractTransactionsFromText(text);
    
    // Save transactions to database
    const savedTransactions = [];
    for (const transactionData of transactions) {
      try {
        const transaction = new Transaction({
          user: req.user._id,
          ...transactionData,
        });
        const savedTransaction = await transaction.save();
        savedTransactions.push(savedTransaction);
      } catch (saveError) {
        console.warn('Could not save transaction:', saveError);
      }
    }
    
    // Clean up the uploaded file
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkError) {
      console.warn('Could not delete uploaded file:', unlinkError);
    }
    
    res.json({
      message: 'PDF processed successfully',
      text: text.substring(0, 500) + (text.length > 500 ? '...' : ''),
      transactions: savedTransactions,
    });
  } catch (error) {
    console.error('Process PDF error:', error);
    
    // Clean up file on error
    if (req.file) {
      try {
        const filePath = path.join(__dirname, '../uploads', req.file.filename);
        fs.unlinkSync(filePath);
      } catch (unlinkError) {
        console.warn('Could not delete uploaded file on error:', unlinkError);
      }
    }
    
    res.status(500).json({ message: 'Error processing PDF: ' + error.message });
  }
};