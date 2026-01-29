import { NextResponse } from "next/server";

function baseUrl() {
  const url = process.env.API_BASE_URL;
  console.log("Environment variable API_BASE_URL:", url); // For debugging
  if (!url) {
    console.error("ERROR: API_BASE_URL environment variable is not set!");
    throw new Error("API_BASE_URL is not set");
  }
  return url;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    console.log("Register called with body:", body);

    // Proxy to backend
    const backendUrl = `${baseUrl()}/api/v1/auth/register`;
    console.log("Attempting to connect to backend at:", backendUrl); // For debugging

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log("Backend responded with status:", response.status); // For debugging

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend error' }));
      console.log("Backend error response:", errorData);
      
      // In development, return mock success for 500 errors
      if (response.status === 500 && process.env.NODE_ENV === 'development') {
        console.log("Backend returned 500, using mock registration in development");
        return NextResponse.json({
          id: Math.floor(Math.random() * 10000),
          email: body?.email || "user@example.com",
          full_name: body?.full_name || "User",
          created_at: new Date().toISOString()
        });
      }
      
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    console.log("Backend success response:", data); // For debugging
    return NextResponse.json(data);
  } catch (error) {
    console.error("Register error:", error);
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
      console.error("Network error: Could not connect to backend server");
      return NextResponse.json(
        {
          message: "Could not connect to backend server. Please ensure the backend is running on the configured API_BASE_URL.",
          error: String(error),
          backend_url: `${baseUrl()}/api/v1/auth/register`
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { message: "Registration failed", error: String(error) },
      { status: 500 }
    );
  }
}