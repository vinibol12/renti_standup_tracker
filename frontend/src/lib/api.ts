import { 
  ApiErrorResponse, 
  LoginResponse, 
  RegistrationResponse, 
  StandupEntry, 
  TeamStandupEntry,
  TodaysStandupResponse,
  UserInfo
} from '@/types/api.types';

// Make sure API_URL is a fully qualified URL with protocol
const API_URL = import.meta.env.VITE_API_URL;

// Custom error class for API errors
export class ApiError extends Error {
  validationErrors?: Record<string, string>;
  
  constructor(message: string, errorData?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    
    if (errorData?.validationErrors) {
      this.validationErrors = errorData.validationErrors;
    }
  }
}

/**
 * Helper function to make API requests
 * Handles authentication headers and error responses consistently
 * @throws {ApiError} When the API response is not ok
 */
async function fetchApi<T>(endpoint: string, options: RequestInit = {}, includeUser = false): Promise<T> {
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...options.headers
  });
  
  // Include user ID in request if logged in and includeUser is true
  if (includeUser) {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      const user = JSON.parse(userJson);
      headers.append('X-User-Id', user._id);
    }
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new ApiError(errorData?.message || 'API request failed', errorData);
  }

  return await response.json();
}

/**
 * Get the current logged in user from localStorage
 */
function getCurrentUser(): UserInfo | null {
  const userJson = localStorage.getItem('currentUser');
  return userJson ? JSON.parse(userJson) : null;
}

// Auth API
export const auth = {
  /**
   * Login user with username
   * @param username The username to login with
   * @returns User information
   * @throws {ApiError} When login fails (e.g., user not found)
   */
  login: async (username: string): Promise<LoginResponse> => {
    const user = await fetchApi<LoginResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },
  
  /**
   * Register a new user
   * @param username Username for new user
   * @param email Email for new user
   * @returns Newly created user information
   * @throws {ApiError} When registration fails (e.g., validation errors)
   */
  register: async (username: string, email: string): Promise<RegistrationResponse> => {
    const user = await fetchApi<RegistrationResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify({ username, email })
    });
    localStorage.setItem('currentUser', JSON.stringify(user));
    return user;
  },
  
  /**
   * Logout the current user
   */
  logout: (): void => {
    localStorage.removeItem('currentUser');
  },
  
  /**
   * Get current user information
   * @returns Current user or null if not logged in
   */
  getCurrentUser: (): UserInfo | null => {
    return getCurrentUser();
  }
};

// Standup API
export const standup = {
  /**
   * Create a new standup entry
   * @param yesterday What was done yesterday
   * @param today What will be done today
   * @param blockers Any blockers or challenges
   * @returns Created standup entry
   * @throws {ApiError} with possible validation errors
   */
  create: async (yesterday: string, today: string, blockers: string): Promise<StandupEntry> => {
    return await fetchApi('/standups', {
      method: 'POST',
      body: JSON.stringify({ yesterday, today, blockers })
    }, true); // Include user ID
  },
  
  /**
   * Update an existing standup entry
   * @param id ID of the standup to update
   * @param yesterday Updated yesterday content
   * @param today Updated today content
   * @param blockers Updated blockers content
   * @returns Updated standup entry
   * @throws {ApiError} with possible validation errors
   */
  update: async (id: string, yesterday: string, today: string, blockers: string): Promise<StandupEntry> => {
    return await fetchApi(`/standups/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ yesterday, today, blockers })
    }, true); // Include user ID
  },
  
  /**
   * Get all standup entries for the current user
   * @param period Filter by period (all, week, month)
   * @returns List of standup entries
   * @throws {ApiError} with possible validation errors
   */
  getAll: async (period: 'all' | 'week' | 'month' = 'all'): Promise<StandupEntry[]> => {
    try {
      const queryParams = period !== 'all' ? `?period=${period}` : '';
      const response = await fetchApi(`/standups${queryParams}`, {
        method: 'GET'
      }, true); // Include user ID
      return response as StandupEntry[];
    } catch (error: unknown) {
      console.error("Error fetching standups:", error);
      throw error;
    }
  },
  
  /**
   * Check if the user has submitted a standup for today
   * @returns Response with hasSubmittedToday flag and standup data if it exists
   * @throws {ApiError} with possible validation errors
   */
  checkTodaysEntry: async (): Promise<TodaysStandupResponse> => {
    return await fetchApi('/standups/check-daily', {
      method: 'GET'
    }, true); // Include user ID
  },
  
  /**
   * Get standups from all team members
   * @param filter Filter by time period (today, yesterday, week)
   * @returns List of team standup entries
   * @throws {ApiError} with possible validation errors
   */
  getTeam: async (filter: 'today' | 'yesterday' | 'week' = 'week'): Promise<TeamStandupEntry[]> => {
    try {
      const queryParams = filter !== 'week' ? `?filter=${filter}` : '';
      const response = await fetchApi(`/standups/team${queryParams}`, {
        method: 'GET'
      }, true); // Include user ID
      return response as TeamStandupEntry[];
    } catch (error: unknown) {
      console.error("Error fetching team standups:", error);
      throw error;
    }
  }
};

export type { 
  StandupEntry, 
  TeamStandupEntry, 
  UserInfo, 
  LoginResponse, 
  RegistrationResponse,
  TodaysStandupResponse
};
