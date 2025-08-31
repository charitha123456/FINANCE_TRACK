const pdf = require('pdf-parse');

const parsePDF = async (dataBuffer) => {
  try {
    console.log('Starting PDF parsing');
    const data = await pdf(dataBuffer);
    console.log('PDF text extracted successfully');
    return data.text;
  } catch (error) {
    console.error('PDF Parse Error:', error);
    throw new Error('Failed to parse PDF document');
  }
};

const extractTransactionsFromText = (text) => {
  console.log('Extracting transactions from PDF text');
  const lines = text.split('\n');
  const transactions = [];
  
  // Enhanced patterns that handle currency symbols ($, €, £, etc.)
  const patterns = [
    // Pattern 1: Date Description Amount (with currency symbols and signs)
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+([^0-9+$\-€£]+?)\s+([-+]?\s*[$€£]?\s*[\d,]+\.\d{2})/i,
    // Pattern 2: Date Amount Description (with currency symbols and signs)
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})\s+([-+]?\s*[$€£]?\s*[\d,]+\.\d{2})\s+([^0-9]+)/i,
    // Pattern 3: Description Amount Date (with currency symbols and signs)
    /([^0-9]+?)\s+([-+]?\s*[$€£]?\s*[\d,]+\.\d{2})\s+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i
  ];
  
  lines.forEach((line, index) => {
    // Skip empty lines and headers
    if (!line.trim() || line.match(/date|description|amount|balance|total/i)) {
      return;
    }
    
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let date, description, amountStr;
        
        if (pattern === patterns[0]) {
          [, date, description, amountStr] = match;
        } else if (pattern === patterns[1]) {
          [, date, amountStr, description] = match;
        } else if (pattern === patterns[2]) {
          [, description, amountStr, date] = match;
        }
        
        description = description.trim();
        
        // Clean the amount string - remove currency symbols and commas
        const cleanAmountStr = amountStr.replace(/[$€£,\s]/g, '');
        const amount = parseFloat(cleanAmountStr);
        
        if (!isNaN(amount) && date && description) {
          // Determine transaction type based on amount sign
          const hasNegativeSign = amountStr.includes('-');
          const hasPositiveSign = amountStr.includes('+');
          
          let type = 'expense'; // Default to expense
          if (hasPositiveSign) {
            type = 'income';
          } else if (!hasNegativeSign && !hasPositiveSign) {
            // If no sign, use context clues from description
            const descLower = description.toLowerCase();
            const isLikelyIncome = descLower.includes('salary') || 
                                  descLower.includes('deposit') || 
                                  descLower.includes('income') ||
                                  descLower.includes('refund') ||
                                  descLower.includes('credit') ||
                                  descLower.includes('payment received');
            type = isLikelyIncome ? 'income' : 'expense';
          }
          
          // Auto-detect category
          let category = 'Other';
          const descLower = description.toLowerCase();
          
          if (descLower.includes('grocery') || descLower.includes('food') || descLower.includes('supermarket') || descLower.includes('market')) {
            category = 'Food';
          } else if (descLower.includes('gas') || descLower.includes('fuel') || descLower.includes('petrol') || descLower.includes('station')) {
            category = 'Transportation';
          } else if (descLower.includes('restaurant') || descLower.includes('dining') || descLower.includes('cafe') || descLower.includes('eat')) {
            category = 'Food';
          } else if (descLower.includes('shopping') || descLower.includes('store') || descLower.includes('mall') || descLower.includes('shop')) {
            category = 'Shopping';
          } else if (descLower.includes('utility') || descLower.includes('electric') || descLower.includes('water') || descLower.includes('bill')) {
            category = 'Utilities';
          } else if (descLower.includes('medical') || descLower.includes('health') || descLower.includes('pharmacy') || descLower.includes('doctor')) {
            category = 'Healthcare';
          } else if (descLower.includes('salary') || descLower.includes('income') || descLower.includes('deposit') || descLower.includes('pay')) {
            category = 'Income';
          } else if (descLower.includes('rent') || descLower.includes('mortgage') || descLower.includes('housing')) {
            category = 'Housing';
          } else if (descLower.includes('entertainment') || descLower.includes('movie') || descLower.includes('game')) {
            category = 'Entertainment';
          }
          
          transactions.push({
            date: new Date(date),
            description,
            amount: Math.abs(amount),
            type: type,
            category: category
          });
          
          console.log(`Parsed: ${date} | ${description} | ${amountStr} → ${amount} | ${type} | ${category}`);
          break;
        }
      }
    }
  });
  
  console.log(`Extracted ${transactions.length} transactions from PDF`);
  return transactions;
};
module.exports = { parsePDF, extractTransactionsFromText };