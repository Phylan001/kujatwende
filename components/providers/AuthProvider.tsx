"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import type { UserSession } from "@/lib/models/User";

/**
 * Authentication context type definition
 * Provides user session management and authentication methods
 */
interface AuthContextType {
  user: UserSession | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: UserSession }>;
  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<{ success: boolean; user?: UserSession }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component
 * Manages user authentication state across the application
 * Handles automatic token verification on mount and provides auth methods
 *
 * Features:
 * - Automatic token verification and session restoration
 * - Role-based authentication (user/admin)
 * - Secure token storage in localStorage
 * - Login/Register/Logout functionality
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Effect: Verify existing auth token on component mount
   * Attempts to restore user session from stored token
   * If token is invalid or expired, it's removed from storage
   */
  useEffect(() => {
    const verifyExistingToken = async () => {
      const token = localStorage.getItem("auth-token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/verify", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          } else {
            // Invalid response format, clear token
            localStorage.removeItem("auth-token");
          }
        } else {
          // Token is invalid or expired
          localStorage.removeItem("auth-token");
        }
      } catch (error) {
        console.error("Token verification error:", error);
        localStorage.removeItem("auth-token");
      } finally {
        setLoading(false);
      }
    };

    verifyExistingToken();
  }, []);

  /**
   * Login function with role-based authentication
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Object containing success status and user data
   *
   * Process:
   * 1. Sends credentials to login API
   * 2. Receives token and user data (including role)
   * 3. Stores token in localStorage
   * 4. Updates user state
   * 5. Returns user data for role-based routing
   */
  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: UserSession }> => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        // Store authentication token
        localStorage.setItem("auth-token", data.token);

        // Update user state
        setUser(data.user);

        // Return success with user data for role-based routing
        return {
          success: true,
          user: data.user,
        };
      }

      // Login failed - invalid credentials
      return { success: false };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false };
    }
  };

  /**
   * Register function for new users
   * Only creates regular "user" accounts - admins must be created directly in DB
   *
   * @param name - User's full name
   * @param email - User's email address
   * @param password - User's password
   * @returns Object containing success status and user data
   *
   * Note: Role is automatically set to "user" on the backend
   * Admins cannot register through this interface
   */
  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: UserSession }> => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role: "user", // Explicitly set role to "user" - admins created manually in DB
        }),
      });

      const data = await response.json();

      if (response.ok && data.token && data.user) {
        // Store authentication token
        localStorage.setItem("auth-token", data.token);

        // Update user state
        setUser(data.user);

        // Return success with user data
        return {
          success: true,
          user: data.user,
        };
      }

      // Registration failed
      return { success: false };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false };
    }
  };

  /**
   * Logout function
   * Clears authentication token and user state
   * After logout, user needs to login again to access protected routes
   */
  const logout = () => {
    localStorage.removeItem("auth-token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access authentication context
 * Must be used within AuthProvider component tree
 *
 * @throws Error if used outside of AuthProvider
 * @returns Authentication context with user state and auth methods
 *
 * Usage:
 * const { user, login, logout, loading } = useAuth()
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
