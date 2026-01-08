function validateVPA(vpa) {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
    return regex.test(vpa);
  }
  
  function validateCardLuhn(number) {
    const clean = number.replace(/\D/g,'');
    let sum = 0, doubleUp = false;
    for (let i = clean.length -1; i >=0; i--) {
      let digit = parseInt(clean[i]);
      if(doubleUp){ digit*=2; if(digit>9)digit-=9;}
      sum+=digit;
      doubleUp=!doubleUp;
    }
    return sum % 10 === 0;
  }
  
  function detectCardNetwork(number){
    const clean = number.replace(/\D/g,'');
    if(/^4/.test(clean)) return 'visa';
    if(/^5[1-5]/.test(clean)) return 'mastercard';
    if(/^3[47]/.test(clean)) return 'amex';
    if(/^60|^65|^8[1-9]/.test(clean)) return 'rupay';
    return 'unknown';
  }
  
  function validateExpiry(month, year){
    month = parseInt(month);
    if(month<1||month>12) return false;
    year = year.length===2? 2000+parseInt(year):parseInt(year);
    const now = new Date();
    const exp = new Date(year, month-1, 1);
    return exp >= new Date(now.getFullYear(), now.getMonth(), 1);
  }
  
  module.exports = { validateVPA, validateCardLuhn, detectCardNetwork, validateExpiry };
  