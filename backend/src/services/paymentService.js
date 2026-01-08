const {
    isValidVPA,
    isValidCardNumber,
    detectCardNetwork,
    isValidExpiry
  } = require("../utils/validation");
  
  const Payment = require("../models/Payment");
  const Order = require("../models/Order");
  
  function generatePaymentId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "pay_";
    for (let i = 0; i < 16; i++) {
      id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return id;
  }
  
  async function processPayment(merchant, body) {
    const { order_id, method } = body;
  
    const order = await Order.getOrderById(order_id);
  
    if (!order || order.merchant_id !== merchant.id) {
      throw { code: "NOT_FOUND_ERROR", message: "Order not found" };
    }
  
    let paymentData = {
      id: generatePaymentId(),
      order_id,
      merchant_id: merchant.id,
      amount: order.amount,
      currency: order.currency,
      method,
      status: "processing"
    };
  
    if (method === "upi") {
      if (!isValidVPA(body.vpa)) {
        throw { code: "INVALID_VPA", message: "Invalid VPA format" };
      }
      paymentData.vpa = body.vpa;
    }
  
    if (method === "card") {
      const card = body.card;
  
      if (
        !card ||
        !isValidCardNumber(card.number) ||
        !isValidExpiry(card.expiry_month, card.expiry_year)
      ) {
        throw { code: "INVALID_CARD", message: "Card validation failed" };
      }
  
      paymentData.card_network = detectCardNetwork(card.number);
      paymentData.card_last4 = card.number.slice(-4);
    }
  
    const payment = await Payment.createPayment(paymentData);
  
    // TEST MODE
    const testMode = process.env.TEST_MODE === "true";
    const delay = testMode
      ? parseInt(process.env.TEST_PROCESSING_DELAY || "1000")
      : Math.floor(Math.random() * 5000) + 5000;
  
    await new Promise((res) => setTimeout(res, delay));
  
    let success;
    if (testMode) {
      success = process.env.TEST_PAYMENT_SUCCESS !== "false";
    } else {
      success = method === "upi"
        ? Math.random() < 0.9
        : Math.random() < 0.95;
    }
  
    if (success) {
      await Payment.updatePayment(payment.id, { status: "success" });
      payment.status = "success";
    } else {
      await Payment.updatePayment(payment.id, {
        status: "failed",
        error_code: "PAYMENT_FAILED",
        error_description: "Payment processing failed"
      });
      payment.status = "failed";
    }
  
    return payment;
  }
  
  module.exports = { processPayment };
  