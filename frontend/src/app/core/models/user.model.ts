export interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: Date;
  lastActive?: Date;
  currentStreak: number;
  longestStreak: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}
