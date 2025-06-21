interface SessionUserData {
  username: string;
  email: string;
  created_at: string;
  uba_score: number;
  profile_completeness_score: number;
  last_uba_update: string | null;
}

interface SessionLog {
    ip_address: string;
    device_info: string;
    timestamp: string;
}

interface SessionResponse {
  user_data: SessionUserData;
  sessions: SessionLog[];
}

/**
 * Fetches the current user's session data from the backend.
 * This is used to validate an existing token and get the latest user info,
 * including the updated UBA score.
 *
 * @param token The JWT token for authorization.
 * @returns A promise that resolves to the session data.
 * @throws An error if the network request fails or the server returns an error.
 */
export const getSession = async (token: string): Promise<SessionResponse> => {
  const response = await fetch(`/api/auth/session`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // If the token is invalid or expired, the server will likely return a 401 or 403.
    // We can throw an error to be caught by the calling function (e.g., in AuthContext).
    const errorData = await response.json().catch(() => ({ message: "Failed to fetch session" }));
    throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
  }

  return response.json();
};

// You can also move your login logic here to keep all auth API calls together.
interface LoginRequest {
    email: string;
    username?: string;
}

interface LoginResponse {
    message: string;
    token: string;
}

/**
 * Logs in a user by sending their credentials to the backend.
 * 
 * @param credentials The user's email and optional username.
 * @returns A promise that resolves to the login response, including the JWT token.
 * @throws An error if the login fails.
 */
export const loginUser = async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`/api/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Login failed" }));
        throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
    }

    return response.json();
}