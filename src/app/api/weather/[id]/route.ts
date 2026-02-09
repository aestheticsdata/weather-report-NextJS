import { NextRequest, NextResponse } from "next/server";
import http from "http";

// Use 127.0.0.1 instead of localhost for better compatibility with Next.js server-side fetch
const API_BASE_URL = process.env.WEATHER_API_URL || "http://127.0.0.1:6000";

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
        // Only add Content-Type if there's a body
        ...(body && { "Content-Type": "application/json" }),
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
        } catch (error) {
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

// GET /api/weather/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = `${API_BASE_URL}/weather/${id}`;
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
        error: "Failed to fetch weather report",
        details: errorMessage,
        hint: "Make sure the weather API is running on http://127.0.0.1:6000"
      },
      { status: 500 }
    );
  }
}

// PATCH /api/weather/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const authHeader = request.headers.get("x-auth-weather");

    const url = `${API_BASE_URL}/weather/${id}`;
    console.log(`PATCHing: ${url}`);

    const response = await makeHttpRequest(url, {
      method: "PATCH",
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
        error: "Failed to update weather report",
        details: errorMessage,
        hint: "Make sure the weather API is running on http://127.0.0.1:6000"
      },
      { status: 500 }
    );
  }
}

// DELETE /api/weather/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("x-auth-weather");

    const url = `${API_BASE_URL}/weather/${id}`;
    console.log(`DELETEing: ${url}`);

    const response = await makeHttpRequest(url, {
      method: "DELETE",
      headers: {
        ...(authHeader && { "x-auth-weather": authHeader }),
      },
    });

    console.log(`DELETE response status: ${response.status}`);
    console.log(`DELETE response data:`, JSON.stringify(response.data, null, 2));

    // DELETE can return 200, 204, or other success statuses
    if (response.status >= 200 && response.status < 300) {
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // If status is 500, it's likely the API interceptor bug
    // The delete might have actually worked despite the error
    // Let's verify by checking if the item still exists
    if (response.status === 500) {
      try {
        // Try to fetch the item to see if it still exists
        const checkResponse = await makeHttpRequest(`${API_BASE_URL}/weather/${id}`, {
          method: "GET",
        });
        
        // If item doesn't exist (404), the delete actually worked
        if (checkResponse.status === 404) {
          console.log("Delete actually succeeded despite 500 error (interceptor bug)");
          return NextResponse.json({ success: true }, { status: 200 });
        }
      } catch (checkError) {
        // If check fails, assume delete might have worked
        console.log("Could not verify delete status, but might have succeeded");
      }
    }

    // Return error response
    const errorMessage = response.data?.error || response.data?.message || "Failed to delete weather report";
    const errorDetails = response.data?.details || response.data;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        statusCode: response.status,
      },
      { status: response.status }
    );
  } catch (error: any) {
    console.error("API proxy error:", error);
    const errorMessage = error?.message || "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to delete weather report",
        details: errorMessage,
        hint: "Make sure the weather API is running on http://127.0.0.1:6000"
      },
      { status: 500 }
    );
  }
}
