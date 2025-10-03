"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users,
  Search,
  Eye,
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  MapPin,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  emailVerified: boolean;
  createdAt: string;
  totalBookings: number;
  totalSpent?: number;
  location?: string;
}

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (user.role !== "admin") {
      setAccessDenied(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      if (response.status === 401 || response.status === 403) {
        router.push("/auth/login");
        return;
      }

      const data = await response.json();
      if (data.users) {
        const sanitizedUsers = data.users.map((user: UserData) => ({
          ...user,
          totalBookings: user.totalBookings || 0,
          totalSpent: user.totalSpent || 0,
          emailVerified: user.emailVerified || false,
        }));
        setUsers(sanitizedUsers);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    // Prevent deletion of admin accounts
    const userToDelete = users.find((u) => u._id === userId);
    if (userToDelete?.role === "admin") {
      toast({
        title: "Action denied",
        description: "Cannot delete admin accounts",
        variant: "destructive",
      });
      return;
    }

    // Prevent user from deleting their own account
    if (userToDelete?.email === user?.email) {
      toast({
        title: "Action denied",
        description: "You cannot delete your own account",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete user: ${userEmail}? This action cannot be undone.`
      )
    )
      return;

    setDeletingUserId(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers(); // Refresh the list
      } else {
        throw new Error(data.error || "Failed to delete user");
      }
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    } finally {
      setDeletingUserId(null);
    }
  };

  const viewUserDetails = (user: UserData) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    return role === "admin"
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const formatCurrency = (amount?: number) => {
    return `KSh ${(amount || 0).toLocaleString()}`;
  };

  // Check if delete button should be disabled
  const isDeleteDisabled = (targetUser: UserData) => {
    return targetUser.role === "admin" || targetUser.email === user?.email;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-cyan-400 mx-auto"></div>
          <p className="text-white/70 mt-4 text-base">
            {authLoading ? "Verifying credentials..." : "Loading users..."}
          </p>
        </div>
      </div>
    );
  }

  if (accessDenied || (user && user.role !== "admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="glass border-red-500/20 max-w-md w-full">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <CardTitle className="text-xl font-bold text-red-400">
              Access Denied
            </CardTitle>
            <CardDescription className="text-white/70">
              You don't have permission to access this page
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-white/80 text-sm">
                This area is restricted to administrators only.
                {user &&
                  user.role === "user" &&
                  " Redirecting to your dashboard..."}
              </p>
            </div>
            <Button
              onClick={() => router.push(user ? "/dashboard" : "/auth/login")}
              className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
            >
              {user ? "Go to Dashboard" : "Go to Login"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg">
            <Users className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">User Management</h1>
            <p className="text-slate-400 text-sm">
              Manage user accounts and permissions
            </p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/10 rounded-lg">
                  <Users className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Total Users</p>
                  <h3 className="text-2xl font-bold text-white">
                    {users.length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <UserCheck className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Normal Users</p>
                  <h3 className="text-2xl font-bold text-white">
                    {users.filter((u) => u.role === "user").length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Shield className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Administrators</p>
                  <h3 className="text-2xl font-bold text-white">
                    {users.filter((u) => u.role === "admin").length}
                  </h3>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-white text-lg">All Users</CardTitle>
                <CardDescription className="text-slate-400">
                  View and manage all registered users
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-4 h-4" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder-white/40 focus:border-cyan-400 text-sm h-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white text-sm h-10 w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mobile Cards View */}
            <div className="block lg:hidden space-y-3">
              {filteredUsers.map((user) => (
                <Card
                  key={user._id}
                  className="bg-slate-700/30 border-slate-600/50 hover:border-cyan-400/30 transition-colors"
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">
                            {user.name}
                          </p>
                          <p className="text-slate-400 text-xs">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge className={`text-xs ${getRoleColor(user.role)}`}>
                          {user.role}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-600/50">
                      <div>
                        <p className="text-xs text-slate-400">Bookings</p>
                        <p className="text-white font-semibold text-sm">
                          {user.totalBookings || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Total Spent</p>
                        <p className="text-white font-semibold text-sm">
                          {formatCurrency(user.totalSpent)}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-slate-600/50">
                      <Button
                        size="sm"
                        onClick={() => viewUserDetails(user)}
                        className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-xs h-8"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDeleteUser(user._id, user.email)}
                        disabled={
                          isDeleteDisabled(user) || deletingUserId === user._id
                        }
                        variant="outline"
                        className={`text-xs h-8 px-2 ${
                          isDeleteDisabled(user)
                            ? "border-gray-500/50 text-gray-400 cursor-not-allowed opacity-50"
                            : "border-red-500/50 text-red-400 hover:bg-red-500/10"
                        }`}
                      >
                        {deletingUserId === user._id ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-white"></div>
                        ) : (
                          <Trash2 className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-lg border border-white/10 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b border-white/10 bg-slate-700/30">
                      <th className="text-left text-white/80 font-medium p-3 text-sm">
                        User
                      </th>
                      <th className="text-left text-white/80 font-medium p-3 text-sm">
                        Contact
                      </th>
                      <th className="text-left text-white/80 font-medium p-3 text-sm">
                        Role
                      </th>
                      <th className="text-left text-white/80 font-medium p-3 text-sm">
                        Bookings
                      </th>
                      <th className="text-left text-white/80 font-medium p-3 text-sm">
                        Total Spent
                      </th>
                      <th className="text-left text-white/80 font-medium p-3 text-sm">
                        Joined
                      </th>
                      <th className="text-left text-white/80 font-medium p-3 text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr
                        key={user._id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center">
                              <User className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <p className="text-white/80 text-sm font-medium">
                                {user.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="text-white/80 text-sm">{user.email}</p>
                          {user.phone && (
                            <p className="text-slate-400 text-xs">
                              {user.phone}
                            </p>
                          )}
                        </td>
                        <td className="p-3">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                        </td>
                        <td className="p-3 text-white/80 text-sm">
                          {user.totalBookings || 0}
                        </td>
                        <td className="p-3 text-white/80 font-semibold text-sm">
                          {formatCurrency(user.totalSpent)}
                        </td>
                        <td className="p-3 text-white/80 text-sm">
                          {format(new Date(user.createdAt), "MMM dd, yyyy")}
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => viewUserDetails(user)}
                              className="bg-slate-700 hover:bg-slate-600 text-white h-8 px-3"
                            >
                              <Eye className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() =>
                                handleDeleteUser(user._id, user.email)
                              }
                              disabled={
                                isDeleteDisabled(user) ||
                                deletingUserId === user._id
                              }
                              className={`h-8 px-3 ${
                                isDeleteDisabled(user)
                                  ? "bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              }`}
                            >
                              {deletingUserId === user._id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-1 border-white"></div>
                              ) : (
                                <Trash2 className="w-3 h-3" />
                              )}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-white/70">No users found</p>
                <p className="text-slate-500 text-sm mt-2">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">User Details</DialogTitle>
            <DialogDescription className="text-slate-400">
              Complete information about this user
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-6 py-4">
              {/* User Profile */}
              <div className="flex items-center gap-4 p-4 bg-slate-700/30 rounded-lg">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">
                    {selectedUser.name}
                    {selectedUser.email === user?.email && (
                      <span className="ml-2 text-sm text-cyan-400">
                        (Current User)
                      </span>
                    )}
                  </h3>
                  <p className="text-slate-400">{selectedUser.email}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  Contact Information
                </h3>
                <div className="space-y-3 p-4 bg-slate-700/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="text-white">{selectedUser.email}</span>
                  </div>
                  {selectedUser.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-white">{selectedUser.phone}</span>
                    </div>
                  )}
                  {selectedUser.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span className="text-white">
                        {selectedUser.location}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Statistics */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400" />
                  Account Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-400">Total Bookings</p>
                    <p className="text-2xl font-bold text-cyan-400 mt-1">
                      {selectedUser.totalBookings || 0}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-400">Total Spent</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                      {formatCurrency(selectedUser.totalSpent)}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-400">Member Since</p>
                    <p className="text-white font-medium mt-1">
                      {format(new Date(selectedUser.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
