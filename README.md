## Payment Gateway System

A fully containerized payment gateway system with backend APIs, merchant dashboard, and public checkout page.
This project simulates real-world payment processing with proper validation, authentication, and async payment flow.

##  Features
Backend (API – Port 8000)

Merchant authentication using API Key & Secret

Order creation and retrieval

Payment initiation (UPI & Card)

Payment status polling

## Strong validation:

UPI VPA format validation

Card number validation using Luhn algorithm

Card network detection (Visa, Mastercard, Amex, RuPay)

Expiry date validation

Async payment processing with success/failure simulation

PostgreSQL database with automatic seeding

## Merchant Dashboard (Frontend – Port 3000)

Merchant login

Display API credentials

Orders list

Transactions list

Real-time payment status updates

Checkout Page (Public – Port 3001)

Order details view

Payment method selection

UPI & Card forms

Processing state

Success & failure states

## Tech Stack
Layer	Technology
Backend	Node.js, Express.js
Frontend	React.js
Database	PostgreSQL
Containerization	Docker, Docker Compose
Auth	API Key + Secret
Validation	Custom logic (Luhn, Regex)
## 📁 Project Structure
payment-gateway/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── config/
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
│
├── payment-frontend/
│   ├── src/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml
└── README.md

## 🐳 Dockerized Setup (ONE COMMAND)
Prerequisites
Docker
Docker Compose

## Start All Services
docker-compose up -d
✔ Backend → http://localhost:8000
✔ Dashboard → http://localhost:3000
✔ Checkout → http://localhost:3001
No manual setup required.

## 🔐 Test Merchant Credentials (Auto-Seeded)
Email: test@merchant.com
API Key: test_api_key_123
API Secret: test_secret_key_123

These credentials are automatically inserted into the database on startup.

## 📡 API Documentation
Create Order
POST /api/v1/orders

Headers

{
  "x-api-key": "test_api_key_123",
  "x-api-secret": "test_secret_key_123",
  "Content-Type": "application/json"
}


Body

{
  "amount": 1000,
  "currency": "INR",
  "receipt": "order_test_1",
  "notes": {
    "note1": "Test order"
  }
}

## Initiate Payment (UPI)
POST /api/v1/payments

{
  "order_id": "order_xxxxx",
  "method": "upi",
  "vpa": "testuser@upi"
}

Initiate Payment (Card)
{
  "order_id": "order_xxxxx",
  "method": "card",
  "card": {
    "number": "4111111111111111",
    "expiry_month": "12",
    "expiry_year": "28",
    "cvv": "123",
    "holder_name": "Test User"
  }
}

## Get Payment Status
GET /api/v1/payments/{payment_id}

## 🧪 Payment Flow

Merchant creates order via API

User opens checkout page with order ID

User selects payment method

Payment created with processing status

Backend simulates async processing

Status updates to success or failed

Frontend polls and updates UI

## 🗄️ Database Schema
merchants

id (UUID)

email

api_key

api_secret

orders

id

merchant_id

amount

currency

status

receipt

notes

payments

id

order_id

merchant_id

method

status

vpa

card_network

card_last4

created_at

updated_at

## 🧠 Architecture Overview
Merchant Dashboard ──▶ Backend API ──▶ PostgreSQL
                           │
                           ▼
                    Checkout Page
