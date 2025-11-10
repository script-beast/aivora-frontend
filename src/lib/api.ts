import axios, { AxiosInstance, AxiosError } from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Clear token and redirect to login
          this.clearToken();
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      },
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
      localStorage.removeItem("auth_user");
    }
  }

  setToken(token: string): void {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem("auth_token", token);
      } else {
        localStorage.removeItem("auth_token");
      }
    }
  }

  // Auth endpoints
  async register(data: { name: string; email: string; password: string }) {
    const response = await this.client.post("/auth/register", data);
    return response.data;
  }

  async login(data: { email: string; password: string }) {
    const response = await this.client.post("/auth/login", data);
    return response.data;
  }

  async getMe() {
    const response = await this.client.get("/auth/me");
    return response.data;
  }

  // Goal endpoints
  async createGoal(data: {
    title: string;
    description?: string;
    duration: number;
    hoursPerDay: number;
    additionalContext?: string;
  }) {
    const response = await this.client.post("/goals", data);
    return response.data;
  }

  async getGoals(status?: string) {
    const response = await this.client.get("/goals", {
      params: status ? { status } : {},
    });
    return response.data;
  }

  async getGoal(id: string) {
    const response = await this.client.get(`/goals/${id}`);
    return response.data;
  }

  async updateGoal(
    id: string,
    data: Partial<{ title: string; description: string; status: string }>,
  ) {
    const response = await this.client.put(`/goals/${id}`, data);
    return response.data;
  }

  async deleteGoal(id: string) {
    const response = await this.client.delete(`/goals/${id}`);
    return response.data;
  }

  async regenerateGoalPlan(id: string, feedback?: string) {
    const response = await this.client.post(`/goals/${id}/regenerate`, {
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
    const response = await this.client.post("/progress", data);
    return response.data;
  }

  async getProgressByGoal(goalId: string) {
    const response = await this.client.get(`/progress/goal/${goalId}`);
    return response.data;
  }

  async getProgressStats(goalId: string) {
    const response = await this.client.get(`/progress/goal/${goalId}/stats`);
    return response.data;
  }

  async updateProgress(
    id: string,
    data: Partial<{ completed: boolean; comment: string; hoursSpent: number }>,
  ) {
    const response = await this.client.put(`/progress/${id}`, data);
    return response.data;
  }

  // Insight endpoints
  async generateInsights(goalId: string) {
    const response = await this.client.post(`/insights/generate/${goalId}`);
    return response.data;
  }

  async getInsightsByGoal(goalId: string) {
    const response = await this.client.get(`/insights/goal/${goalId}`);
    return response.data;
  }

  async getLatestInsight(goalId: string) {
    const response = await this.client.get(`/insights/goal/${goalId}/latest`);
    return response.data;
  }

  // PDF endpoint
  async downloadGoalReport(
    goalId: string,
  ): Promise<{ blob: Blob; filename: string }> {
    const response = await this.client.get(`/pdf/report/${goalId}`, {
      responseType: "blob",
    });

    // Extract filename from Content-Disposition header
    const contentDisposition = response.headers["content-disposition"];
    let filename = "goal_report.pdf";

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }

    return {
      blob: new Blob([response.data], { type: "application/pdf" }),
      filename,
    };
  }
}

export const api = new ApiClient();
export default api;
