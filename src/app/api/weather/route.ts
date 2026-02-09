import { NextRequest, NextResponse } from "next/server";
import http from "http";

// Use 127.0.0.1 instead of localhost for better compatibility with Next.js server-side fetch
const API_BASE_URL = process.env.WEATHER_API_URL || "http://127.0.0.1:6000";
const AUTH_TOKEN = "JOECOOL123";

// Initial reports to populate the API
const INITIAL_REPORTS = [
  {
    city: "chamonix",
    country: "France",
    temperature: -5,
    condition: "snowy" as const,
    userId: "user-1",
  },
  {
    city: "london",
    country: "UK",
    temperature: 10.4312,
    condition: "rainy" as const,
    userId: "user-2",
  },
  {
    city: "Tokyo",
    country: "Japan",
    temperature: 15,
    condition: "cloudy" as const,
    userId: "user-3",
  },
  {
    city: "Tokyo",
    country: "Japan",
    temperature: 34,
    condition: "sunny" as const,
    userId: "user-3",
  },
  {
    city: "New York",
    country: "USA",
    temperature: 22,
    condition: "stormy" as const,
    userId: "user-3",
  },
  {
    city: "Madrid",
    country: "Spain",
    temperature: 28,
    condition: "sunny" as const,
    userId: "user-1",
  },
];

// Flag to track if initialization has been attempted (module-level, resets on server restart)
let initializationAttempted = false;

// Helper function to make HTTP requests using Node.js http module
function makeHttpRequest(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {}
): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const { method = "GET", headers = {}, body } = options;

    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    };

    const req = http.request(requestOptions, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          // Handle empty responses (common for DELETE requests)
          if (!data || data.trim() === "") {
            resolve({ status: res.statusCode || 200, data: {} });
            return;
          }
          const parsedData = JSON.parse(data);
          resolve({ status: res.statusCode || 200, data: parsedData });
        } catch {
          // If JSON parsing fails, return the raw data or empty object
          resolve({ status: res.statusCode || 200, data: data || {} });
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    if (body) {
      req.write(body);
    }

    req.end();
  });
}

// Helper function to initialize the API with sample data
async function initializeApiData() {
  // Prevent multiple simultaneous initialization attempts
  if (initializationAttempted) {
    return;
  }

  try {
    // Check current state of API
    const response = await makeHttpRequest(`${API_BASE_URL}/weather`, {
      method: "GET",
    });

    if (response.status !== 200) {
      console.log("API not accessible, skipping initialization");
      return;
    }

    const data = response.data;
    
    // Check if we need to initialize
    if (Array.isArray(data) && data.length > 0) {
      // Check if we have all the expected initial reports
      const existingCities = data.map((r: any) => `${r.city?.toLowerCase()},${r.country?.toLowerCase()}`);
      const expectedCities = INITIAL_REPORTS.map(r => `${r.city.toLowerCase()},${r.country.toLowerCase()}`);
      
      const missingCities = expectedCities.filter(expected => 
        !existingCities.some((existing: string) => existing === expected)
      );
      
      if (missingCities.length === 0) {
        console.log(`API already has all ${INITIAL_REPORTS.length} initial reports, skipping initialization`);
        return;
      }
      
      console.log(`API has ${data.length} reports, but missing ${missingCities.length} initial reports:`, missingCities);
      // Continue to create missing reports
    }

    // Mark as attempted before starting to prevent concurrent calls
    initializationAttempted = true;

    // Get existing cities to avoid duplicates
    const existingData = Array.isArray(data) ? data : [];
    const existingCities = existingData.map((r: any) => `${r.city?.toLowerCase()},${r.country?.toLowerCase()}`);

    // Initialize with ALL sample data (only create missing ones)
    console.log("=== Initializing API with sample data ===");
    const reportsToCreate = INITIAL_REPORTS.filter(r => {
      const cityKey = `${r.city.toLowerCase()},${r.country.toLowerCase()}`;
      return !existingCities.includes(cityKey);
    });
    
    if (reportsToCreate.length === 0) {
      console.log("All initial reports already exist, skipping creation");
      return;
    }
    
    console.log(`Creating ${reportsToCreate.length} missing reports out of ${INITIAL_REPORTS.length} total...`);
    console.log("Reports to create:", reportsToCreate.map(r => `${r.city} (${r.country})`).join(", "));
    
    const createdReports: string[] = [];
    const failedReports: string[] = [];
    
    for (let i = 0; i < reportsToCreate.length; i++) {
      const report = reportsToCreate[i];
      try {
        console.log(`[${i + 1}/${reportsToCreate.length}] Creating: ${report.city}, ${report.country}...`);
        const createResponse = await makeHttpRequest(`${API_BASE_URL}/weather`, {
          method: "POST",
          headers: {
            "x-auth-weather": AUTH_TOKEN,
          },
          body: JSON.stringify(report),
        });

        if (createResponse.status === 200 || createResponse.status === 201) {
          console.log(`✓ [${i + 1}/${reportsToCreate.length}] SUCCESS: ${report.city}, ${report.country}`);
          createdReports.push(`${report.city}, ${report.country}`);
        } else {
          console.error(`✗ [${i + 1}/${reportsToCreate.length}] FAILED: ${report.city}, ${report.country} - Status: ${createResponse.status}`, JSON.stringify(createResponse.data));
          failedReports.push(`${report.city}, ${report.country} (Status: ${createResponse.status})`);
        }
      } catch (error: any) {
        console.error(`✗ [${i + 1}/${reportsToCreate.length}] ERROR creating ${report.city}, ${report.country}:`, error?.message || error);
        failedReports.push(`${report.city}, ${report.country} (Error: ${error?.message || "Unknown"})`);
      }
      
      // Small delay between requests to avoid overwhelming the API
      if (i < reportsToCreate.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    console.log("=== Initialization Summary ===");
    console.log(`Created: ${createdReports.length}/${reportsToCreate.length}`);
    if (createdReports.length > 0) {
      console.log("Successfully created:", createdReports.join(", "));
    }
    if (failedReports.length > 0) {
      console.error("Failed to create:", failedReports.join(", "));
    }
    console.log("=== Initialization complete ===");
  } catch (error) {
    console.error("Failed to initialize API data:", error);
    // Reset flag on error so we can retry
    initializationAttempted = false;
  }
}

export type WeatherReport = {
  id: string;
  city: string;
  country: string;
  temperature: number;
  condition: "sunny" | "rainy" | "cloudy" | "stormy" | "snowy";
  userId: string;
};

// Proxy GET requests to the external API
export async function GET(request: NextRequest) {
  try {
    // Initialize API data on first GET request (only if fetching all reports)
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const city = searchParams.get("city");
    const country = searchParams.get("country");
    
    // Only initialize if we're fetching all reports (no filters)
    if (!id && !city && !country) {
      await initializeApiData();
    }

    let url = `${API_BASE_URL}/weather`;
    
    if (id) {
      url = `${API_BASE_URL}/weather/${id}`;
    } else if (city) {
      url = `${API_BASE_URL}/weather/city/${encodeURIComponent(city)}`;
    } else if (country) {
      url = `${API_BASE_URL}/weather/country/${encodeURIComponent(country)}`;
    }

    console.log(`Fetching from: ${url}`);

    const response = await makeHttpRequest(url, {
      method: "GET",
    });

    if (response.status >= 400) {
      return NextResponse.json(response.data, { status: response.status });
    }

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error("API proxy error:", error);
    const errorMessage = error?.message || "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to fetch weather data",
        details: errorMessage,
        hint: "Make sure the weather API is running on http://127.0.0.1:6000"
      },
      { status: 500 }
    );
  }
}

// Proxy POST requests to create weather reports
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get("x-auth-weather");

    const url = `${API_BASE_URL}/weather`;
    console.log(`POSTing to: ${url}`);

    const response = await makeHttpRequest(url, {
      method: "POST",
      headers: {
        ...(authHeader && { "x-auth-weather": authHeader }),
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("API proxy error:", error);
    const errorMessage = error?.message || "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to create weather report",
        details: errorMessage,
        hint: "Make sure the weather API is running on http://127.0.0.1:6000"
      },
      { status: 500 }
    );
  }
}

// Proxy DELETE requests (delete all)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("x-auth-weather");

    const url = `${API_BASE_URL}/weather`;
    console.log(`DELETEing: ${url}`);

    const response = await makeHttpRequest(url, {
      method: "DELETE",
      headers: {
        ...(authHeader && { "x-auth-weather": authHeader }),
      },
    });

    if (response.status === 200 || response.status === 204) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error("API proxy error:", error);
    const errorMessage = error?.message || "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to delete weather reports",
        details: errorMessage,
        hint: "Make sure the weather API is running on http://127.0.0.1:6000"
      },
      { status: 500 }
    );
  }
}
