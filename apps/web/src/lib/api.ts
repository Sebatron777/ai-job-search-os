const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    register: (data: { email: string; password: string; name?: string }) =>
      fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    login: (data: { email: string; password: string }) =>
      fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Users
  users: {
    getMe: () => fetchApi("/users/me"),
    updateMe: (data: { name?: string; avatarUrl?: string }) =>
      fetchApi("/users/me", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  // Workspaces
  workspaces: {
    list: () => fetchApi("/workspaces"),
    get: (slug: string) => fetchApi(`/workspaces/${slug}`),
    create: (data: { name: string; slug: string }) =>
      fetchApi("/workspaces", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Profiles
  profiles: {
    get: (workspaceId: string) =>
      fetchApi(`/profiles/me?workspaceId=${workspaceId}`),
    create: (workspaceId: string, data: any) =>
      fetchApi(`/profiles?workspaceId=${workspaceId}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
  },

  // Jobs
  jobs: {
    list: (workspaceId: string, filters?: any) => {
      const params = new URLSearchParams({ workspaceId });
      if (filters?.status) params.append("status", filters.status);
      return fetchApi(`/jobs?${params}`);
    },
    get: (id: string) => fetchApi(`/jobs/${id}`),
  },

  // Applications
  applications: {
    list: (workspaceId: string, status?: string) => {
      const params = new URLSearchParams({ workspaceId });
      if (status) params.append("status", status);
      return fetchApi(`/applications?${params}`);
    },
    get: (id: string) => fetchApi(`/applications/${id}`),
  },

  // Analytics
  analytics: {
    funnel: (workspaceId: string) =>
      fetchApi(`/analytics/funnel?workspaceId=${workspaceId}`),
  },
};
