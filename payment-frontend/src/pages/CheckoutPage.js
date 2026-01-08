// src/pages/CheckoutPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function CheckoutPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [method, setMethod] = useState("");
  const [vpa, setVpa] = useState("");
  const [card, setCard] = useState({
    number: "",
    expiry_month: "",
    expiry_year: "",
    cvv: "",
    holder_name: "",
  });
  const [payment, setPayment] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [pollingInterval, setPollingInterval] = useState(null);

  // Fetch public order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/v1/orders/public/${orderId}`
        );
        setOrder(res.data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setStatusMessage("Failed to load order details.");
      }
    };
    fetchOrder();
    return () => clearInterval(pollingInterval);
  }, [orderId]);

  // Poll payment status
  useEffect(() => {
    if (payment && payment.id) {
      const interval = setInterval(async () => {
        try {
          const res = await axios.get(
            `http://localhost:8000/api/v1/payments/public/${payment.id}`
          );
          setPayment(res.data);

          if (res.data.status === "success") {
            setStatusMessage("Payment successful!");
            clearInterval(interval);
          } else if (res.data.status === "failed") {
            setStatusMessage("Payment failed. Try again.");
            clearInterval(interval);
          }
        } catch (err) {
          console.error("Error polling payment:", err);
        }
      }, 2000);

      setPollingInterval(interval);
      return () => clearInterval(interval);
    }
  }, [payment]);

  // Handle payment submission
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!method) {
      setStatusMessage("Select a payment method.");
      return;
    }

    try {
      const payload = { order_id: order.id, method };
      if (method === "upi") payload.vpa = vpa;
      if (method === "card") payload.card = card;

      // POST to public payments endpoint
      const res = await axios.post(
        "http://localhost:8000/api/v1/payments/public",
        payload
      );

      setPayment(res.data);
      setStatusMessage("Processing payment...");
    } catch (err) {
      console.error("Payment error:", err);
      setStatusMessage(
        err.response?.data?.error?.description || "Failed to initiate payment."
      );
    }
  };

  if (!order) return <div>Loading order...</div>;

  return (
    <div>
      <h2>Checkout</h2>
      <div>
        <p>Order ID: {order.id}</p>
        <p>Amount: ₹{order.amount}</p>
        <p>Currency: {order.currency}</p>
        <p>Status: {order.status}</p>
      </div>

      <form onSubmit={handlePayment}>
        <h3>Select Payment Method</h3>
        <select value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="">--Select--</option>
          <option value="upi">UPI</option>
          <option value="card">Card</option>
        </select>

        {method === "upi" && (
          <div>
            <label>VPA:</label>
            <input
              type="text"
              value={vpa}
              onChange={(e) => setVpa(e.target.value)}
              placeholder="example@upi"
            />
          </div>
        )}

        {method === "card" && (
          <div>
            <label>Card Number:</label>
            <input
              type="text"
              value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value })}
            />
            <label>Expiry Month:</label>
            <input
              type="text"
              value={card.expiry_month}
              onChange={(e) =>
                setCard({ ...card, expiry_month: e.target.value })
              }
            />
            <label>Expiry Year:</label>
            <input
              type="text"
              value={card.expiry_year}
              onChange={(e) =>
                setCard({ ...card, expiry_year: e.target.value })
              }
            />
            <label>CVV:</label>
            <input
              type="text"
              value={card.cvv}
              onChange={(e) => setCard({ ...card, cvv: e.target.value })}
            />
            <label>Card Holder Name:</label>
            <input
              type="text"
              value={card.holder_name}
              onChange={(e) =>
                setCard({ ...card, holder_name: e.target.value })
              }
            />
          </div>
        )}

        <button type="submit">Pay Now</button>
      </form>

      {statusMessage && <p>{statusMessage}</p>}

      {payment && (
        <div>
          <h4>Payment Details</h4>
          <p>Payment ID: {payment.id}</p>
          <p>Status: {payment.status}</p>
          {payment.method === "upi" && <p>VPA: {payment.vpa}</p>}
          {payment.method === "card" && (
            <p>
              Card Network: {payment.card_network} | Last4: {payment.card_last4}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default CheckoutPage;
