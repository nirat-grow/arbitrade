# ⚡ Karometa Arbitrage API Documentation

> Welcome to the official Karometa Arbitrage API documentation. This document outlines all available backend REST APIs and Real-Time WebSocket connections for the UI Bot.

**Base URL**: `https://krometaarbitrage.blockcryp.com`

---

## 🌐 REST Endpoints

### 1. Save Package Submission
Saves a new user package purchase into the database. This must be called before a user can start trading.

- **Endpoint:** `POST /api/save-package`
- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "userId": "user_12345",
  "packageOrderNo": "PKG-982374",
  "packageName": "Premium Arbitrage",
  "amount": 150.00,
  "dateTime": "2026-09-01T10:00:00Z",
  "description": "Subscription payment"
}
```
- **Success Response (201):**
```json
{
  "success": true,
  "message": "Package saved successfully",
  "id": 1
}
```

### 2. Start Auto-Trade Session
Authenticates a user and starts their 24-hour smart trading session. Generates exactly 3% profit over 24 hours.

- **Endpoint:** `POST /api/start-trade`
- **Content-Type:** `application/json`
- **Request Body:**
```json
{
  "userId": "user_12345"
}
```
- **Success Response (200):**
```json
{
  "success": true, 
  "message": "24-Hour Auto-Trade started successfully!"
}
```
- **Error Responses:**
  - `404 Not Found`: User ID not found or no package purchased.
  - `429 Too Many Requests`: Auto-Trade session is already running for this user.

### 3. Get User Profile (Live Progress)
Fetches a user's package balance, live profit progress, countdown timer, and recent trade history.

- **Endpoint:** `GET /api/user-profile/:userId`
- **Success Response (200):**
```json
{
  "success": true,
  "profile": {
    "userId": "user_12345",
    "balance": 150.00,
    "sessionActive": true,
    "currentProfit": 2.25,
    "targetProfit": 4.50,
    "endTime": "2026-09-02T10:00:00.000Z"
  },
  "trades": [
    {
      "id": 45,
      "user_id": "user_12345",
      "trade_amount": "150.00",
      "profit_amount": "0.003125",
      "trade_details": { "network": "Polygon", "type": "CROSS-CHAIN" },
      "created_at": "2026-09-01T10:15:00.000Z"
    }
  ]
}
```

### 4. Get User's Full Trade History
Fetches every single trade executed for a specific user across their entire history.

- **Endpoint:** `GET /api/trade-history/:userId`
- **Success Response (200):**
```json
{
  "success": true,
  "totalTrades": 150,
  "trades": [
    {
      "id": 102,
      "user_id": "user_12345",
      "trade_amount": "150.00",
      "profit_amount": "0.003125",
      "trade_details": { "network": "Ethereum", "type": "TRIANGULAR" },
      "created_at": "2026-09-01T12:00:00.000Z"
    }
  ]
}
```

### 5. Get Master History (Admin & Filters)
Fetches up to the latest 10,000 trades across the entire platform. Supports powerful filtering by user or timeframes.

- **Endpoint:** `GET /api/all-history`
- **Query Parameters (Optional):**
  - `userId`: Filter by a specific user (e.g., `?userId=user_123`)
  - `timeframe`: Filter by date range (Options: `today`, `last7days`, `thismonth`) (e.g., `?timeframe=today`)
- **Example Usage:** `GET /api/all-history?userId=user_123&timeframe=today`
- **Success Response (200):**
```json
{
  "success": true,
  "totalTrades": 250,
  "trades": [
    {
      "id": 105,
      "user_id": "user_123",
      "trade_amount": "150.00",
      "profit_amount": "0.003125",
      "trade_details": { "network": "Polygon", "type": "CROSS-CHAIN" },
      "created_at": "2026-09-01T15:00:00.000Z"
    }
  ]
}
```

---

## 📡 WebSockets (Real-Time Live Feeds)

> The platform provides a highly optimized WebSocket server for real-time live trading data. It pushes data instantly without polling.

**Base WebSocket URL**: `wss://krometaarbitrage.blockcryp.com/ws`

### 1. Global Market Feed
Connect without any parameters to receive the global market feed. This includes all live trades executing across the platform, mixed with dynamic market activity.

- **Connection URL:** `wss://krometaarbitrage.blockcryp.com/ws`
- **Message Format:** JSON Array of active signals/trades. Pushed automatically every `2` seconds.

### 2. Personal Live Trades (Private Feed)
Pass a `userId` in the query string to instantly filter the WebSocket to **only** receive trades executed specifically for that user. This pushes instantly the moment the 24-hour background engine generates a trade.

- **Connection URL:** `wss://krometaarbitrage.blockcryp.com/ws?userId=user_12345`
- **Message Format:** JSON Array containing the specific real-time trade event.
