"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-white/10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 gap-2">
            <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto">
              <Image
                src="/logo.png"
                alt="KujaTwende Icon"
                width={48}
                height={48}
                className="w-10 h-10 sm:w-12 sm:h-12"
              />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              <span className="text-primary">KUJA</span>TWENDE.
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-white/80 hover:text-cyan-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/destinations"
              className="text-white/80 hover:text-cyan-400 transition-colors"
            >
              Destinations
            </Link>
            <Link
              href="/packages"
              className="text-white/80 hover:text-cyan-400 transition-colors"
            >
              Packages
            </Link>
            <Link
              href="/about"
              className="text-white/80 hover:text-cyan-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="/contact"
              className="text-white/80 hover:text-cyan-400 transition-colors"
            >
              Contact
            </Link>
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm" className="text-white/80">
                    <User className="w-4 h-4 mr-2" />
                    {user.name}
                  </Button>
                </Link>
                {user.role === "admin" && (
                  <Link href="/admin">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-cyan-400 text-cyan-400 bg-transparent"
                    >
                      Admin
                    </Button>
                  </Link>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-white/80"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/auth/login">
                  <Button variant="ghost" size="sm" className="text-white/80">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10">
            <nav className="flex flex-col space-y-4 mt-4">
              <Link
                href="/"
                className="text-white/80 hover:text-cyan-400 transition-colors"
              >
                Home
              </Link>
              <Link
                href="/packages"
                className="text-white/80 hover:text-cyan-400 transition-colors"
              >
                Packages
              </Link>
              <Link
                href="/destinations"
                className="text-white/80 hover:text-cyan-400 transition-colors"
              >
                Destinations
              </Link>
              <Link
                href="/about"
                className="text-white/80 hover:text-cyan-400 transition-colors"
              >
                About
              </Link>
              <Link
                href="/contact"
                className="text-white/80 hover:text-cyan-400 transition-colors"
              >
                Contact
              </Link>
              {user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                  <Link href="/dashboard" className="text-white/80">
                    Dashboard
                  </Link>
                  {user.role === "admin" && (
                    <Link href="/admin" className="text-cyan-400">
                      Admin Panel
                    </Link>
                  )}
                  <button onClick={logout} className="text-left text-white/80">
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-white/10">
                  <Link href="/auth/login" className="text-white/80">
                    Login
                  </Link>
                  <Link href="/auth/register" className="text-cyan-400">
                    Sign Up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
