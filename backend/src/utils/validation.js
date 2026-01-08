// src/utils/validation.js

// VPA VALIDATION
function isValidVPA(vpa) {
    const vpaRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return vpaRegex.test(vpa);
  }
  
  // LUHN ALGORITHM
  function isValidCardNumber(cardNumber) {
    const cleaned = cardNumber.replace(/[\s-]/g, "");
  
    if (!/^\d{13,19}$/.test(cleaned)) return false;
  
    let sum = 0;
    let shouldDouble = false;
  
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i]);
  
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
  
      sum += digit;
      shouldDouble = !shouldDouble;
    }
  
    return sum % 10 === 0;
  }
  
  // CARD NETWORK
  function detectCardNetwork(cardNumber) {
    const num = cardNumber.replace(/[\s-]/g, "");
  
    if (num.startsWith("4")) return "visa";
  
    const firstTwo = parseInt(num.slice(0, 2));
    if (firstTwo >= 51 && firstTwo <= 55) return "mastercard";
  
    if (num.startsWith("34") || num.startsWith("37")) return "amex";
  
    if (
      num.startsWith("60") ||
      num.startsWith("65") ||
      (firstTwo >= 81 && firstTwo <= 89)
    ) {
      return "rupay";
    }
  
    return "unknown";
  }
  
  // EXPIRY DATE
  function isValidExpiry(month, year) {
    month = parseInt(month);
    year = parseInt(year);
  
    if (month < 1 || month > 12) return false;
  
    if (year < 100) year += 2000;
  
    const now = new Date();
    const expiry = new Date(year, month);
  
    return expiry > now;
  }
  
  module.exports = {
    isValidVPA,
    isValidCardNumber,
    detectCardNetwork,
    isValidExpiry
  };
  