const Tesseract = require('tesseract.js');
const fs = require('fs');

const extractTextFromImage = async (imagePath) => {
  try {
    console.log('Starting OCR processing for:', imagePath);
    
    const { data: { text } } = await Tesseract.recognize(
      imagePath,
      'eng',
      { 
        logger: m => console.log(m),
        // Improve OCR accuracy for receipts
        tessedit_pageseg_mode: '6', // Assume a single uniform block of text
        tessedit_char_whitelist: '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ$€£¥.,/-(): '
      }
    );
    
    console.log('OCR extracted text:', text);
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to process image with OCR');
  }
};

const parseReceiptText = (text) => {
  console.log('Parsing receipt text:', text);
  
  // Enhanced regex patterns to extract amount and date from receipts
  const amountMatch = text.match(/(?:total|amount|amt|balance|due|€|£|¥|₹|₩|₪|₺|₴|₦|₲|₡|₵|₸|₿|RS|USD|EUR|GBP|JPY|KRW|CNY|CAD|AUD|CHF|NZD)[\s:]*([0-9]+[.,]?[0-9]*)/i);
  const dateMatch = text.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})|(?:date|on)[\s:]*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i);
  
  let amount = amountMatch ? parseFloat(amountMatch[1].replace(',', '.')) : null;
  let date = dateMatch ? new Date(dateMatch[0]) : new Date();
  
  if (isNaN(amount)) amount = null;
  if (isNaN(date.getTime())) date = new Date();
  
  // Try to detect category from text
  let category = 'Other';
  const textLower = text.toLowerCase();
  
  if (textLower.includes('grocery') || textLower.includes('food') || textLower.includes('restaurant')) {
    category = 'Food';
  } else if (textLower.includes('gas') || textLower.includes('fuel') || textLower.includes('transport')) {
    category = 'Transportation';
  } else if (textLower.includes('medical') || textLower.includes('health') || textLower.includes('pharmacy')) {
    category = 'Healthcare';
  } else if (textLower.includes('utility') || textLower.includes('electric') || textLower.includes('water')) {
    category = 'Utilities';
  }
  
  return {
    amount,
    date,
    category,
    description: 'Extracted from receipt',
    type: amount !== null && amount > 0 ? 'expense' : 'income'
  };
};

module.exports = { extractTextFromImage, parseReceiptText };