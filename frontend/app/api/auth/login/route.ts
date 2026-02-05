import { NextResponse } from "next/server";
import { cookies } from "next/headers";

function baseUrl() {
  const url = process.env.API_BASE_URL;
  if (!url) {
    if (process.env.NODE_ENV !== 'production') {
      return 'https://laiqak-chatbot-ai.hf.space';
    }
    throw new Error("API_BASE_URL is not set");
  }
  return url;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    // In development, use mock response
    if (process.env.NODE_ENV === 'development') {
      const mockResponse = {
        accessToken: "mock-access-token-" + Date.now(),
        tokenType: "bearer",
        user: {
          id: Math.floor(Math.random() * 1000),
          email: body?.email || "test@example.com",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      };

      const cookieStore = await cookies();
      if (mockResponse.accessToken) {
        cookieStore.set("access_token", mockResponse.accessToken, {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 60,
        });
      }

      if (mockResponse.user?.id) {
        cookieStore.set("user_id", mockResponse.user.id.toString(), {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
          path: "/",
          maxAge: 30 * 60,
        });
      }

      return NextResponse.json(mockResponse);
    }

    // Production: Proxy to backend
    const backendUrl = `${baseUrl()}/api/v1/auth/login`;
    
    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Backend error' }));
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    
    // Set cookies from backend response
    const cookieStore = await cookies();
    if (data.accessToken) {
      cookieStore.set("access_token", data.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60,
      });
    }

    if (data.user?.id) {
      cookieStore.set("user_id", data.user.id.toString(), {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 60,
      });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Login failed", error: String(error) },
      { status: 500 }
    );
  }
}