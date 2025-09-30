"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  User as UserIcon,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  /**
   * Handles the login form submission with role-based routing
   * - Validates credentials via API
   * - Automatically routes to /admin for admin users
   * - Routes to /dashboard for regular users
   * - Shows appropriate error messages for failed attempts
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Login returns the user object with role information
      const result = await login(email, password);

      if (result.success && result.user) {
        // Role-based routing: admins go to /admin, users go to /dashboard
        const redirectPath =
          result.user.role === "admin" ? "/admin" : "/dashboard";
        const welcomeMessage =
          result.user.role === "admin"
            ? "Welcome back, Administrator!"
            : `Welcome back, ${result.user.name}!`;

        toast({
          title: welcomeMessage,
          description: `Redirecting to your ${
            result.user.role === "admin" ? "admin" : "user"
          } dashboard...`,
        });

        // Redirect based on user role
        router.push(redirectPath);
      } else {
        // Generic error message to prevent user enumeration
        toast({
          title: "Login failed",
          description: "Invalid email or password. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Login error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Card className="glass border-white/10 animate-fade-scale">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Image
                src="/logo.png"
                alt="KujaTwende Icon"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-white/70">
              Sign in to your Kuja Twende account
            </CardDescription>

            {/* Role indicator info */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-white/50">
              <div className="flex items-center gap-1">
                <UserIcon className="w-3 h-3" />
                <span>User Dashboard</span>
              </div>
              <div className="w-px h-4 bg-white/20" />
              <div className="flex items-center gap-1">
                <Shield className="w-3 h-3" />
                <span>Admin Dashboard</span>
              </div>
            </div>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/80">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 pr-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                    required
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-cyan-400 transition-colors"
                    disabled={loading}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Info message about automatic routing */}
              <div className="text-xs text-white/60 bg-white/5 p-3 rounded-lg border border-white/10">
                <p className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>
                    You'll be automatically redirected to your dashboard based
                    on your account type
                  </span>
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4 pt-5">
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 transition-all duration-300"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center text-white/70">
                Don't have an account?{" "}
                <Link
                  href="/auth/register"
                  className="text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Sign up
                </Link>
              </div>

              <Link
                href="/"
                className="text-center text-white/60 hover:text-cyan-400 text-sm transition-colors"
              >
                ← Back to Home
              </Link>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
