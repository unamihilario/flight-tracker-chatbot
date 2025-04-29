
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// API Keys
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCM1UwDOB3SSmjizjH0cVScroXWBbHEdx8';
const FLIGHT_API_KEY = process.env.FLIGHT_API_KEY || 'b0e30e2732msha5de84dd089485fp168be5jsn11418decf66e';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// API Routes
// 1. Gemini AI Endpoint
app.post('/api/gemini', async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Use actual Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(message);
    const response = await result.response;
    const text = response.text();
    
    res.json({ response: text });
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    res.status(500).json({ error: 'Failed to process your request' });
  }
});

// 2. Flight Tracking Endpoint
app.post('/api/track', async (req, res) => {
  try {
    const { flightNumber, date } = req.body;
    
    if (!flightNumber) {
      return res.status(400).json({ error: 'Flight number is required' });
    }
    
    // Parse the flight number to handle formats like "Air India AI 101"
    const parsedFlightNumber = parseFlightNumber(flightNumber);
    if (!parsedFlightNumber) {
      return res.status(400).json({ error: 'Invalid flight number format' });
    }
    
    const today = date || new Date().toISOString().split('T')[0];
    
    // Call AeroDataBox API for real flight data
    const apiUrl = `https://aerodatabox.p.rapidapi.com/flights/number/${parsedFlightNumber}/${today}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'X-RapidAPI-Key': FLIGHT_API_KEY,
        'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API responded with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the API response to match our expected format
    const flightData = {
      flightNumber: data.number || parsedFlightNumber,
      airline: data.airline?.name || extractAirlineName(flightNumber),
      status: data.status || 'Unknown',
      departure: {
        airport: {
          name: data.departure?.airport?.name || 'Unknown',
          iataCode: data.departure?.airport?.iataCode || 'Unknown'
        },
        scheduledTime: data.departure?.scheduledTime || 'Unknown',
        terminal: data.departure?.terminal || 'Unknown',
        gate: data.departure?.gate || 'Unknown'
      },
      arrival: {
        airport: {
          name: data.arrival?.airport?.name || 'Unknown',
          iataCode: data.arrival?.airport?.iataCode || 'Unknown'
        },
        scheduledTime: data.arrival?.scheduledTime || 'Unknown',
        terminal: data.arrival?.terminal || 'Unknown',
        gate: data.arrival?.gate || 'Unknown'
      }
    };
    
    res.json({ flight: flightData });
  } catch (error) {
    console.error('Error tracking flight:', error);
    res.status(500).json({ error: 'Failed to track flight. Please verify the flight number and try again.' });
  }
});

// Helper function to parse flight numbers from various formats
function parseFlightNumber(input) {
  // Format: "Airline Name XX 123"
  const fullFormatMatch = input.match(/[A-Z]{2}\s*\d{1,4}/i);
  if (fullFormatMatch) {
    // Return just the code and number without spaces
    return fullFormatMatch[0].replace(/\s+/g, '');
  }
  
  // If it's already in correct format (e.g., "BA123")
  const simpleFormatMatch = input.match(/^[A-Z]{2}\d{1,4}$/i);
  if (simpleFormatMatch) {
    return input;
  }
  
  return null;
}

// Helper function to extract airline name from user input
function extractAirlineName(input) {
  const airlineCodeMatch = input.match(/([A-Z]{2})\s*\d{1,4}/i);
  
  const airlineCodes = {
    'AI': 'Air India',
    'BA': 'British Airways',
    'LH': 'Lufthansa',
    'AA': 'American Airlines',
    'UA': 'United Airlines',
    'DL': 'Delta Air Lines',
    'EK': 'Emirates',
    'QF': 'Qantas',
    'SQ': 'Singapore Airlines',
    'CX': 'Cathay Pacific'
  };
  
  if (airlineCodeMatch && airlineCodeMatch[1]) {
    const code = airlineCodeMatch[1].toUpperCase();
    return airlineCodes[code] || 'Unknown Airline';
  }
  
  // If the input starts with an airline name
  for (const [code, name] of Object.entries(airlineCodes)) {
    if (input.toLowerCase().includes(name.toLowerCase())) {
      return name;
    }
  }
  
  return 'Unknown Airline';
}

// Start server
app.listen(port, () => {
  console.log(`TeoBot server running on port ${port}`);
});
