/**
 * Type definitions for the API client
 */

// Define interface for API error responses
export interface ApiErrorResponse {
  message: string;
  validationErrors?: Record<string, string>;
}

// User related types
export interface UserInfo {
  _id: string;
  username: string;
  email: string;
}

export interface LoginResponse {
  _id: string;
  username: string;
  email: string;
}

export interface RegistrationResponse {
  _id: string;
  username: string;
  email: string;
}

// Standup related types
export interface StandupEntry {
  _id: string;
  userId: string | UserInfo;
  yesterday: string;
  today: string;
  blockers: string;
  createdAt: string;
}

export interface TeamStandupEntry {
  _id: string;
  userId: UserInfo;
  yesterday: string;
  today: string;
  blockers: string;
  createdAt: string;
}

export interface TodaysStandupResponse {
  hasSubmittedToday: boolean;
  standup: StandupEntry | null;
}
