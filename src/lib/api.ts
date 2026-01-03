// API client for authentication only
import type {
  RegisterRequest,
  LoginRequest,
  OTPVerifyRequest,
  ResendOTPRequest,
  ResetPasswordRequest,
  VerifyResetPasswordRequest,
  RegisterResponse,
  AuthResponse,
  OTPVerifyResponse,
  ResendOTPResponse,
  ResetPasswordResponse,
  VerifyResetPasswordResponse,
  GoogleOAuthRequest,
} from "@/types/auth";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://192.168.194.248:5000";

class ApiClient {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // Set access token for authenticated requests
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Add Authorization header if access token is available
    if (this.accessToken) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${this.accessToken}`,
      };
    }

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Extract error message from nested error object if present
        let errorMessage =
          errorData.message ||
          errorData.error?.message ||
          (typeof errorData.error === "string" ? errorData.error : null) ||
          `HTTP ${response.status}: ${response.statusText}`;

        // Handle data wrapper if present
        if (errorData.data && typeof errorData.data === "object") {
          errorMessage =
            errorData.data.message ||
            errorData.data.error?.message ||
            errorMessage;
        }

        // Ensure we have a string message, not an object
        if (typeof errorMessage !== "string") {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }

        // Create error with response data preserved
        const error = new Error(errorMessage) as Error & {
          response?: {
            status: number;
            data: unknown;
          };
        };

        error.response = {
          status: response.status,
          data: errorData,
        };

        throw error;
      }

      const data = await response.json();

      // Unwrap data if response is wrapped in { data: ... }
      if (data.data) {
        return data.data;
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // Authentication endpoints
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    return this.request<RegisterResponse>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyOTP(data: OTPVerifyRequest): Promise<OTPVerifyResponse> {
    return this.request<OTPVerifyResponse>("/api/v1/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resendOTP(data: ResendOTPRequest): Promise<ResendOTPResponse> {
    return this.request<ResendOTPResponse>("/api/v1/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async googleOAuth(data: GoogleOAuthRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/google-oauth", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/refresh-token", {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async requestResetPassword(
    data: ResetPasswordRequest
  ): Promise<ResetPasswordResponse> {
    return this.request<ResetPasswordResponse>(
      "/api/v1/auth/forgot-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async verifyResetPassword(
    data: VerifyResetPasswordRequest
  ): Promise<VerifyResetPasswordResponse> {
    return this.request<VerifyResetPasswordResponse>(
      "/api/v1/auth/verify-reset-password",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    );
  }

  async resetPassword(data: {
    token: string;
    newPassword: string;
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: data.token, newPassword: data.newPassword }),
    });
  }

  async verifyEmail(token: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  // ========== AUCTION ENDPOINTS ==========

  async getAuctions(params?: AuctionFilters): Promise<AuctionListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.category_id) searchParams.append("category_id", params.category_id.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.sort_by) searchParams.append("sort_by", params.sort_by);
    if (params?.sort_order) searchParams.append("sort_order", params.sort_order);

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/auctions${queryString ? `?${queryString}` : ""}`;

    return this.request<AuctionListResponse>(endpoint, { method: "GET" });
  }

  async getAuctionItem(id: number): Promise<AuctionItem> {
    return this.request<AuctionItem>(`/api/v1/auctions/${id}`, { method: "GET" });
  }

  async getAuctionItemBids(id: number): Promise<Bid[]> {
    return this.request<Bid[]>(`/api/v1/auctions/${id}/bids`, { method: "GET" });
  }

  async getCategories(): Promise<Category[]> {
    return this.request<Category[]>("/api/v1/auctions/categories", { method: "GET" });
  }

  async placeBid(itemId: number, bidAmount: number): Promise<Bid> {
    return this.request<Bid>("/api/v1/bids", {
      method: "POST",
      body: JSON.stringify({ item_id: itemId, bid_amount: bidAmount }),
    });
  }

  async getMyBids(): Promise<Bid[]> {
    return this.request<Bid[]>("/api/v1/bids/my-bids", { method: "GET" });
  }

  // ========== ADMIN AUCTION ENDPOINTS ==========

  async getSellers(): Promise<Seller[]> {
    return this.request<Seller[]>("/api/v1/admin/auctions/sellers", { method: "GET" });
  }

  async createSeller(data: CreateSellerRequest): Promise<Seller> {
    return this.request<Seller>("/api/v1/admin/auctions/sellers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getOrganizers(): Promise<Organizer[]> {
    return this.request<Organizer[]>("/api/v1/admin/auctions/organizers", { method: "GET" });
  }

  async createOrganizer(data: CreateOrganizerRequest): Promise<Organizer> {
    return this.request<Organizer>("/api/v1/admin/auctions/organizers", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    return this.request<Category>("/api/v1/admin/auctions/categories", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getAdminAuctions(params?: AdminAuctionFilters): Promise<AdminAuctionListResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.search) searchParams.append("search", params.search);

    const queryString = searchParams.toString();
    const endpoint = `/api/v1/admin/auctions/items${queryString ? `?${queryString}` : ""}`;

    return this.request<AdminAuctionListResponse>(endpoint, { method: "GET" });
  }

  async createAuctionItem(data: CreateAuctionItemRequest): Promise<AdminAuctionItem> {
    return this.request<AdminAuctionItem>("/api/v1/admin/auctions/items", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAuctionItem(id: number, data: Partial<CreateAuctionItemRequest>): Promise<AdminAuctionItem> {
    return this.request<AdminAuctionItem>(`/api/v1/admin/auctions/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async publishAuctionItem(id: number): Promise<void> {
    await this.request<void>(`/api/v1/admin/auctions/items/${id}/publish`, {
      method: "POST",
    });
  }

  async deleteAuctionItem(id: number): Promise<void> {
    await this.request<void>(`/api/v1/admin/auctions/items/${id}`, {
      method: "DELETE",
    });
  }
}

// ========== AUCTION TYPES ==========

export interface AuctionFilters {
  page?: number;
  limit?: number;
  category_id?: number;
  search?: string;
  sort_by?: string;
  sort_order?: string;
}

export interface AuctionItem {
  id: number;
  lot_code: string;
  name: string;
  category: string;
  image: string;
  current_bid: number;
  previous_bid: number;
  starting_price: number;
  total_bids: number;
  time_left: string;
  is_hot: boolean;
  status: string;
  description: string;
  images: string[];
  schedule?: {
    auction_start: string;
    auction_end: string;
  };
}

export interface AuctionListResponse {
  data: AuctionItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface Category {
  id: number;
  category_name: string;
  parent_category_id?: number;
  description?: string;
}

export interface Bid {
  id: number;
  item_id: number;
  user_id: string;
  bid_amount: number;
  bid_type: string;
  bid_status: string;
  is_highest: boolean;
  bid_time: string;
}

// ========== ADMIN TYPES ==========

export interface Seller {
  id: number;
  seller_name: string;
  seller_type: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
}

export interface CreateSellerRequest {
  seller_name: string;
  seller_type: string;
  address?: string;
  phone?: string;
  email?: string;
  contact_person?: string;
}

export interface Organizer {
  id: number;
  organizer_name: string;
  organizer_code?: string;
  organizer_type: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  email?: string;
}

export interface CreateOrganizerRequest {
  organizer_name: string;
  organizer_type: string;
  organizer_code?: string;
  address?: string;
  city?: string;
  province?: string;
  phone?: string;
  email?: string;
}

export interface CreateCategoryRequest {
  category_name: string;
  parent_category_id?: number;
  description?: string;
}

export interface AdminAuctionFilters {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}

export interface AdminAuctionItem {
  id: number;
  lot_code: string;
  item_name: string;
  category_id: number;
  category?: Category;
  seller_id: number;
  seller?: Seller;
  organizer_id: number;
  organizer?: Organizer;
  item_type: string;
  sub_type?: string;
  description?: string;
  detailed_description?: string;
  limit_price: number;
  deposit_amount: number;
  starting_price: number;
  current_highest_bid: number;
  increment_amount: number;
  auction_method: string;
  status: string;
  view_count: number;
  bid_count: number;
  images?: ItemImage[];
  schedule?: AuctionSchedule;
  created_at: string;
  updated_at: string;
}

export interface ItemImage {
  id: number;
  item_id: number;
  image_url: string;
  image_type: string;
  display_order: number;
  caption?: string;
}

export interface AuctionSchedule {
  id: number;
  item_id: number;
  registration_start?: string;
  registration_end?: string;
  deposit_deadline: string;
  auction_start: string;
  auction_end: string;
  announcement_date?: string;
}

export interface CreateAuctionItemRequest {
  lot_code: string;
  item_name: string;
  category_id: number;
  seller_id: number;
  organizer_id: number;
  item_type: string;
  sub_type?: string;
  description?: string;
  detailed_description?: string;
  limit_price: number;
  deposit_amount: number;
  starting_price?: number;
  increment_amount?: number;
  auction_method?: string;
  images?: CreateImageRequest[];
  schedule?: CreateScheduleRequest;
}

export interface CreateImageRequest {
  image_url: string;
  image_type: string;
  display_order: number;
  caption?: string;
}

export interface CreateScheduleRequest {
  registration_start?: string;
  registration_end?: string;
  deposit_deadline: string;
  auction_start: string;
  auction_end: string;
  announcement_date?: string;
}

export interface AdminAuctionListResponse {
  data: AdminAuctionItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

// Create API client instance
export const api = new ApiClient(API_BASE_URL);

// Token management utilities
export class TokenManager {
  private static ACCESS_TOKEN_KEY = "access_token";
  private static REFRESH_TOKEN_KEY = "refresh_token";

  static setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
    }
  }

  static getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }
    return null;
  }

  static getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }
    return null;
  }

  static clearTokens(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.ACCESS_TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
  }

  static async refreshAccessToken(): Promise<string | null> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    try {
      const response = await api.refreshToken(refreshToken);
      this.setTokens(response.access_token, response.refresh_token);
      return response.access_token;
    } catch (error) {
      console.error("Token refresh failed:", error);
      this.clearTokens();
      return null;
    }
  }
}
