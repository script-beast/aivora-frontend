import axios, { AxiosInstance } from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  private clearToken(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  public setToken(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    const response = await this.axiosInstance.post("/auth/register", data);
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.axiosInstance.post("/auth/login", data);
    if (response.data.token) {
      this.setToken(response.data.token);
      // Also sync with zustand store
      if (typeof window !== 'undefined') {
        const { setToken } = await import('@/store/authStore').then(m => m.useAuthStore.getState());
        setToken(response.data.token);
      }
    }
    return response.data;
  }

  async getMe() {
    const response = await this.axiosInstance.get("/auth/me");
    return response.data;
  }

  // Goal endpoints
  async createGoal(data: {
    title: string;
    description?: string;
    duration: number;
    hoursPerDay: number;
  }) {
    const response = await this.axiosInstance.post("/goals", data);
    return response.data;
  }

  async getGoals() {
    const response = await this.axiosInstance.get("/goals");
    return response.data;
  }

  async getGoal(id: string) {
    const response = await this.axiosInstance.get(`/goals/${id}`);
    return response.data;
  }

  async updateGoal(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: string;
    }
  ) {
    const response = await this.axiosInstance.put(`/goals/${id}`, data);
    return response.data;
  }

  async deleteGoal(id: string) {
    const response = await this.axiosInstance.delete(`/goals/${id}`);
    return response.data;
  }

  async regenerateGoalPlan(id: string, feedback?: string) {
    const response = await this.axiosInstance.post(`/goals/${id}/regenerate`, {
      feedback,
    });
    return response.data;
  }

  // Progress endpoints
  async createProgress(data: {
    goalId: string;
    day: number;
    completed: boolean;
    comment?: string;
    hoursSpent?: number;
  }) {
    const response = await this.axiosInstance.post("/progress", data);
    return response.data;
  }

  async getProgressByGoal(goalId: string) {
    const response = await this.axiosInstance.get(`/progress/goal/${goalId}`);
    return response.data;
  }

  async getProgressStats(goalId: string) {
    const response = await this.axiosInstance.get(`/progress/stats/${goalId}`);
    return response.data;
  }

  async updateProgress(
    id: string,
    data: {
      completed?: boolean;
      comment?: string;
    }
  ) {
    const response = await this.axiosInstance.put(`/progress/${id}`, data);
    return response.data;
  }

  // Insight endpoints
  async generateInsights(goalId: string) {
    const response = await this.axiosInstance.post(`/insights/generate/${goalId}`);
    return response.data;
  }

  async getInsightsByGoal(goalId: string) {
    const response = await this.axiosInstance.get(`/insights/goal/${goalId}`);
    return response.data;
  }

  async getLatestInsight(goalId: string) {
    const response = await this.axiosInstance.get(`/insights/latest/${goalId}`);
    return response.data;
  }

  // PDF endpoints
  async downloadGoalReport(goalId: string) {
    const response = await this.axiosInstance.get(`/pdf/report/${goalId}`, {
      responseType: "blob",
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    
    // Extract filename from Content-Disposition header if available
    const contentDisposition = response.headers["content-disposition"];
    let filename = "goal-report.pdf";
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }
    }
    
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  }
}

// Create a single instance
export const api = new ApiClient();

// Also export individual API objects for backward compatibility
export const authAPI = {
  register: (data: { name: string; email: string; password: string }) => 
    api.register(data),
  login: (data: { email: string; password: string }) => 
    api.login(data),
  getMe: () => 
    api.getMe(),
};

export const goalAPI = {
  create: (data: { title: string; description?: string; duration: number; hoursPerDay: number }) =>
    api.createGoal(data),
  getAll: () => 
    api.getGoals(),
  getById: (id: string) => 
    api.getGoal(id),
  update: (id: string, data: { title?: string; description?: string; status?: string }) =>
    api.updateGoal(id, data),
  delete: (id: string) => 
    api.deleteGoal(id),
  regenerate: (id: string, feedback?: string) => 
    api.regenerateGoalPlan(id, feedback),
};

export const progressAPI = {
  create: (data: { goalId: string; day: number; completed: boolean; comment?: string; hoursSpent?: number }) =>
    api.createProgress(data),
  getByGoal: (goalId: string) => 
    api.getProgressByGoal(goalId),
  getStats: (goalId: string) => 
    api.getProgressStats(goalId),
  update: (id: string, data: { completed?: boolean; comment?: string }) =>
    api.updateProgress(id, data),
};

export const insightAPI = {
  generate: (goalId: string) => 
    api.generateInsights(goalId),
  getByGoal: (goalId: string) => 
    api.getInsightsByGoal(goalId),
  getLatest: (goalId: string) => 
    api.getLatestInsight(goalId),
};

export const pdfAPI = {
  download: (goalId: string) => 
    api.downloadGoalReport(goalId),
};
