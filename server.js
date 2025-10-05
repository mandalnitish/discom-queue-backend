// server.js - Full Backend with MongoDB Atlas

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIO = require('socket.io');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Atlas Connection
const MONGODB_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/discom_queue';
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB Atlas Connected!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// ============== SCHEMAS ==============
// (Your tokenSchema, counterSchema, staffSchema, statisticsSchema remain the same)
const tokenSchema = new mongoose.Schema({
  tokenId: { type: String, required: true, unique: true },
  customerId: String,
  customerName: String,
  customerPhone: String,
  serviceType: { 
    type: String, 
    enum: ['New Connection', 'Bill Payment', 'Technical Issues', 'Documentation'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['waiting', 'serving', 'completed', 'cancelled'],
    default: 'waiting'
  },
  counterId: { type: Number, required: true },
  priority: { type: Number, default: 0 },
  estimatedWaitTime: Number,
  createdAt: { type: Date, default: Date.now },
  calledAt: Date,
  completedAt: Date,
  rating: Number,
  feedback: String
});

const counterSchema = new mongoose.Schema({
  counterId: { type: Number, required: true, unique: true },
  counterName: String,
  serviceType: String,
  staffId: String,
  staffName: String,
  status: { 
    type: String, 
    enum: ['active', 'break', 'offline'],
    default: 'offline'
  },
  currentToken: String,
  tokensServedToday: { type: Number, default: 0 },
  avgServiceTime: { type: Number, default: 0 }
});

const staffSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['staff', 'admin'], default: 'staff' },
  assignedCounter: Number,
  createdAt: { type: Date, default: Date.now }
});

const statisticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  totalTokens: { type: Number, default: 0 },
  tokensServed: { type: Number, default: 0 },
  tokensCancelled: { type: Number, default: 0 },
  avgWaitTime: { type: Number, default: 0 },
  avgServiceTime: { type: Number, default: 0 },
  customerSatisfaction: { type: Number, default: 0 },
  peakHours: [String]
});

const Token = mongoose.model('Token', tokenSchema);
const Counter = mongoose.model('Counter', counterSchema);
const Staff = mongoose.model('Staff', staffSchema);
const Statistics = mongoose.model('Statistics', statisticsSchema);

// ============== REST OF YOUR BACKEND CODE ==============
// Authentication, Tokens, Counters, Statistics routes
// Socket.IO events, Utility functions
// (Keep all your original code exactly the same as your old server.js)

// ========== START SERVER ==========

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  // Initialize default counters if needed
  const counterCount = await Counter.countDocuments();
  if (counterCount === 0) {
    const defaultCounters = [
      { counterId: 1, counterName: 'Counter 1', serviceType: 'Bill Payment' },
      { counterId: 2, counterName: 'Counter 2', serviceType: 'New Connection' },
      { counterId: 3, counterName: 'Counter 3', serviceType: 'Technical Issues' },
      { counterId: 4, counterName: 'Counter 4', serviceType: 'Documentation' }
    ];
    await Counter.insertMany(defaultCounters);
    console.log('Default counters initialized');
  }
});

module.exports = { app, server, io };
