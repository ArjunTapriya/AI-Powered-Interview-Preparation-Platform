const API_BASE_URL = "http://localhost:4000/api";

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  let token = localStorage.getItem("interview_prep_token");
  
  const headers = new Headers(options.headers || {});
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized - Attempt token refresh
  if (response.status === 401) {
    try {
      const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        if (refreshData.success && refreshData.data?.accessToken) {
          // Update token in localStorage
          token = refreshData.data.accessToken;
          localStorage.setItem("interview_prep_token", token as string);

          // Retry original request
          headers.set("Authorization", `Bearer ${token}`);
          response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
          });
        }
      } else {
        // Refresh failed, clear token and let the application handle logout via state
        localStorage.removeItem("interview_prep_token");
      }
    } catch (error) {
      console.error("Token refresh failed:", error);
      localStorage.removeItem("interview_prep_token");
    }
  }

  return response;
}
