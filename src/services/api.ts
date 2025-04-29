
// API service for TeoBot with real integrations and fallback to mock data

// Mock API for development purposes
const mockResponses = {
  welcomeMessage: "👋 Hi there! I'm TeoBot, your flight assistant. How can I help you today?",
  options: ["Track a Flight", "Chat with TeoBot"],
  flightOptions: {
    type: ["Domestic", "International"],
    airports: {
      domestic: ["DEL (Delhi)", "BOM (Mumbai)", "BLR (Bangalore)", "HYD (Hyderabad)", "CCU (Kolkata)"],
      international: ["JFK (New York)", "LHR (London)", "DXB (Dubai)", "SIN (Singapore)", "SYD (Sydney)"]
    }
  },
  flightStatusMock: (flightNumber: string) => {
    // Parse the flight number to handle formats like "Air India AI 101"
    const parsedFlightNumber = parseFlightNumber(flightNumber);
    const airlineName = extractAirlineName(flightNumber);
    
    return {
      flightNumber: parsedFlightNumber || flightNumber,
      airline: airlineName,
      status: ["On Time", "Delayed", "Boarding", "In Air", "Landed"][Math.floor(Math.random() * 5)],
      departure: {
        airport: {
          name: flightNumber.includes("JFK") ? "Indira Gandhi International Airport" : "Chhatrapati Shivaji International Airport",
          iataCode: flightNumber.includes("JFK") ? "DEL" : "BOM"
        },
        scheduledTime: new Date(Date.now() + Math.random() * 10000000).toISOString(),
        terminal: ["T1", "T2", "T3"][Math.floor(Math.random() * 3)],
        gate: ["A1", "B2", "C3", "D4", "E5"][Math.floor(Math.random() * 5)]
      },
      arrival: {
        airport: {
          name: flightNumber.includes("JFK") ? "John F. Kennedy International Airport" : "Heathrow Airport",
          iataCode: flightNumber.includes("JFK") ? "JFK" : "LHR"
        },
        scheduledTime: new Date(Date.now() + Math.random() * 20000000).toISOString(),
        terminal: ["T1", "T2", "T3"][Math.floor(Math.random() * 3)],
        gate: ["A1", "B2", "C3", "D4", "E5"][Math.floor(Math.random() * 5)]
      }
    };
  },
  chatResponses: {
    "flights from india to newyork": "There are several airlines offering flights from India to New York, including Air India, United Airlines, Emirates, Qatar Airways, and Etihad Airways. Most flights connect via Dubai, Doha, or Abu Dhabi. Direct flights are available from Delhi and Mumbai to JFK Airport, typically taking around 15-16 hours. The average price range is $800-1500 depending on the season.",
    "international flight from india to jfk": "There are multiple daily international flights from India to JFK (New York). Air India offers direct flights from Delhi (DEL) and Mumbai (BOM) to JFK, taking approximately 15-16 hours. Other carriers like Emirates, Qatar Airways, and Etihad Airways offer one-stop services via their respective hubs. Ticket prices typically range from $800-1500 depending on the season, with peak prices during summer and December holidays.",
    "international flight from india to new york": "There are multiple daily international flights connecting India to New York. Air India operates direct flights from Delhi and Mumbai to JFK Airport, with a flight time of approximately 15-16 hours. Other carriers like Emirates, Qatar Airways, and Etihad Airways offer one-stop connections via Dubai, Doha, or Abu Dhabi. Flights typically cost between $800-1500 depending on the season, with higher prices during summer and winter holidays.",
    "flights to new york": "New York is served by three major airports: JFK (international flights), Newark Liberty (EWR, both domestic and international), and LaGuardia (LGA, mainly domestic). JFK handles most international traffic with direct flights from major global cities. Airlines serving New York include American Airlines, Delta, United, Emirates, British Airways, Air India, and many more. Flight prices vary widely depending on origin, season, and how far in advance you book.",
    "flight status": "To check the status of a specific flight, please use the 'Track a Flight' option from the main menu. You'll need to provide the airline code and flight number (e.g., AI101 for Air India flight 101).",
    "flight delays": "Flight delays can occur due to various factors including weather conditions, air traffic congestion, mechanical issues, or operational constraints. Real-time flight status information is available through the 'Track a Flight' option from the main menu.",
    "best time to book flights": "The best time to book international flights is typically 2-3 months before departure for the best rates. For domestic flights, booking 1-2 months ahead is often optimal. Tuesdays and Wednesdays are generally considered the cheapest days to book flights, and flying mid-week (Tuesday-Thursday) often results in lower fares than weekend travel.",
    "cheap flights": "To find cheap flights, I recommend: 1) Using flight comparison tools like Skyscanner, Google Flights, or Kayak, 2) Being flexible with your travel dates, 3) Setting up price alerts, 4) Booking 2-3 months in advance, 5) Considering nearby alternative airports, 6) Flying mid-week when possible, and 7) Looking out for airline sales and promotions.",
    "luggage allowance": "Luggage allowance varies by airline and fare class. Economy class typically allows 1-2 checked bags (23-30kg each) on international flights, and 1 bag on domestic flights. Carry-on allowance is usually one bag plus a personal item. Premium cabins offer more generous allowances. Always check your specific airline's policy as restrictions and fees may apply.",
    "visa requirements": "Visa requirements depend on your nationality and destination. For US travel, most visitors need a B1/B2 visitor visa or an ESTA for eligible countries. European Schengen countries require a Schengen visa for many non-EU visitors. Always check the official embassy or immigration website of your destination country for the most accurate and current information.",
    "covid travel restrictions": "COVID-19 travel restrictions continue to evolve globally. Many countries have lifted entry restrictions, while others still require proof of vaccination, pre-travel testing, or health declarations. I recommend checking the official government website of your destination country and consulting your airline's travel requirements page for the most up-to-date information before traveling.",
    "default": "I'm TeoBot, your AI flight assistant. I can help you with flight information, travel advice, and answer questions about airports, airlines, and travel regulations. How else can I assist with your travel needs today?"
  }
};

// Function to simulate API delay
const simulateDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to parse flight numbers from various formats
const parseFlightNumber = (input: string) => {
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
};

// Helper function to extract airline name from user input
const extractAirlineName = (input: string) => {
  const airlineCodeMatch = input.match(/([A-Z]{2})\s*\d{1,4}/i);
  
  const airlineCodes: Record<string, string> = {
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
};

// Helper function to match user queries to appropriate responses
const findBestChatResponse = (userQuery: string) => {
  const lowerCaseQuery = userQuery.toLowerCase().trim();
  
  // Direct match
  if (mockResponses.chatResponses[lowerCaseQuery]) {
    return mockResponses.chatResponses[lowerCaseQuery];
  }
  
  // Partial match based on keywords
  const keywords = {
    "flight from india": ["flights from india", "international flight from india"],
    "new york": ["flights from india to newyork", "international flight from india to new york"],
    "jfk": ["international flight from india to jfk"],
    "cheap flight": ["cheap flights"],
    "book flight": ["best time to book flights"],
    "luggage": ["luggage allowance"],
    "visa": ["visa requirements"],
    "covid": ["covid travel restrictions"],
    "delay": ["flight delays"],
    "status": ["flight status"]
  };
  
  for (const [keyword, responseKeys] of Object.entries(keywords)) {
    if (lowerCaseQuery.includes(keyword)) {
      // Return the first matching response
      for (const key of responseKeys) {
        if (mockResponses.chatResponses[key]) {
          return mockResponses.chatResponses[key];
        }
      }
    }
  }
  
  return mockResponses.chatResponses.default;
};

// API functions
export const api = {
  // Get welcome message
  getWelcomeMessage: async () => {
    await simulateDelay();
    return {
      message: mockResponses.welcomeMessage,
      options: mockResponses.options
    };
  },

  // Get flight type options
  getFlightTypeOptions: async () => {
    await simulateDelay(500);
    return {
      message: "What type of flight would you like to track?",
      options: mockResponses.flightOptions.type
    };
  },

  // Get airport options based on flight type
  getAirportOptions: async (flightType: string) => {
    await simulateDelay(800);
    const airports = flightType.toLowerCase() === "domestic" 
      ? mockResponses.flightOptions.airports.domestic
      : mockResponses.flightOptions.airports.international;
    
    return {
      message: `Please select the airport for your ${flightType.toLowerCase()} flight:`,
      options: airports
    };
  },

  // Ask for flight number
  askForFlightNumber: async (airport: string) => {
    await simulateDelay(500);
    const airportCode = airport.split(" ")[0].replace(/[()]/g, "");
    
    return {
      message: `Please enter your flight number for ${airportCode}:`
    };
  },

  // Track flight with real API or fallback to mock
  trackFlight: async (flightNumber: string) => {
    try {
      const response = await fetch('/api/track', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ flightNumber })
      });

      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        console.log('Using mock flight data due to API error or invalid response');
        // Fallback to mock data
        const mockFlight = mockResponses.flightStatusMock(flightNumber);
        return { flight: mockFlight };
      }

      return await response.json();
    } catch (error) {
      console.log('Using mock flight data due to API error:', error);
      // Fallback to mock data
      const mockFlight = mockResponses.flightStatusMock(flightNumber);
      return { flight: mockFlight };
    }
  },

  // Chat with real Gemini AI or fallback to mock
  chatWithBot: async (message: string) => {
    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) {
        console.log('Using mock chat response due to API error or invalid response');
        // Find the most appropriate mock response
        const mockResponse = findBestChatResponse(message);
        return { message: mockResponse };
      }

      return await response.json();
    } catch (error) {
      console.log('Using mock chat response due to API error:', error);
      // Find the most appropriate mock response
      const mockResponse = findBestChatResponse(message);
      return { message: mockResponse };
    }
  }
};
