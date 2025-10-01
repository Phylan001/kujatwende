"use client";

import { useState, useEffect } from "react";
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
  Edit,
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  UserCheck,
  UserX,
} from "lucide-react";
import { format } from "date-fns";

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "user" | "admin";
  status: "active" | "inactive" | "suspended";
  emailVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  totalBookings: number;
  totalSpent: number;
  location?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchUsers();
        setIsViewDialogOpen(false);
      }
    } catch (error) {
      console.error("Error updating user status:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error("Error deleting user:", error);
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
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleColor = (role: string) => {
    return role === "admin"
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-blue-500/20 text-blue-400 border-blue-500/30";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "inactive":
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      case "suspended":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Users className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Users</h2>
          <p className="text-slate-400 mt-1 text-xs sm:text-base">
            Manage user accounts and permissions
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border-cyan-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Total Users
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-cyan-400 mt-2">
              {users.length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Active Users
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-green-400 mt-2">
              {users.filter((u) => u.status === "active").length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Administrators
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-purple-400 mt-2">
              {users.filter((u) => u.role === "admin").length}
            </h3>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
          <CardContent className="p-4">
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Verified Users
            </p>
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-400 mt-2">
              {users.filter((u) => u.emailVerified).length}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Main Card */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-white text-lg sm:text-xl">
                All Users
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs sm:text-sm">
                View and manage all registered users
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white text-sm">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="block lg:hidden space-y-3">
            {filteredUsers.map((user) => (
              <Card
                key={user._id}
                className="bg-slate-700/30 border-slate-600/50 hover:border-cyan-400/50 transition-colors"
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
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-600/50">
                    <div>
                      <p className="text-xs text-slate-400">Bookings</p>
                      <p className="text-white font-semibold">
                        {user.totalBookings}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Total Spent</p>
                      <p className="text-white font-semibold">
                        KSh {user.totalSpent.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-600/50">
                    <Button
                      size="sm"
                      onClick={() => viewUserDetails(user)}
                      className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-slate-600 text-white hover:bg-slate-700 text-xs"
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDeleteUser(user._id)}
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block rounded-lg border border-white/10 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-slate-700/30">
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    User
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Email
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Role
                  </th>
                  <th className="text-left text-white/80 font-medium p-3 text-sm">
                    Status
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-white/80 text-sm font-medium">
                            {user.name}
                          </p>
                          {user.emailVerified && (
                            <p className="text-green-400 text-xs flex items-center gap-1">
                              <UserCheck className="w-3 h-3" />
                              Verified
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-white/80 text-sm">{user.email}</td>
                    <td className="p-3">
                      <Badge className={getRoleColor(user.role)}>
                        {user.role}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-white/80 text-sm">
                      {user.totalBookings}
                    </td>
                    <td className="p-3 text-white/80 font-semibold text-sm">
                      KSh {user.totalSpent.toLocaleString()}
                    </td>
                    <td className="p-3 text-white/80 text-sm">
                      {format(new Date(user.createdAt), "MMM dd, yyyy")}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => viewUserDetails(user)}
                          className="bg-slate-700 hover:bg-slate-600 text-white"
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteUser(user._id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 sm:w-16 sm:h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-white/70 text-sm sm:text-base">No users found</p>
              <p className="text-slate-500 text-xs sm:text-sm mt-2">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

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
                  </h3>
                  <p className="text-slate-400">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                    {selectedUser.emailVerified && (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-cyan-400" />
                  Contact Information
                </h3>
                <div className="space-y-2 p-4 bg-slate-700/30 rounded-lg">
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
                      <span className="text-white">{selectedUser.location}</span>
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
                      {selectedUser.totalBookings}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-400">Total Spent</p>
                    <p className="text-2xl font-bold text-green-400 mt-1">
                      KSh {selectedUser.totalSpent.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-400">Member Since</p>
                    <p className="text-white font-medium mt-1">
                      {format(new Date(selectedUser.createdAt), "MMM dd, yyyy")}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-700/30 rounded-lg">
                    <p className="text-xs text-slate-400">Last Login</p>
                    <p className="text-white font-medium mt-1">
                      {selectedUser.lastLogin
                        ? format(new Date(selectedUser.lastLogin), "MMM dd, yyyy")
                        : "Never"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-slate-700">
                {selectedUser.status === "active" ? (
                  <Button
                    onClick={() =>
                      handleUpdateUserStatus(selectedUser._id, "suspended")
                    }
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Suspend User
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      handleUpdateUserStatus(selectedUser._id, "active")
                    }
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-2" />
                    Activate User
                  </Button>
                )}
                <Button
                  onClick={() => handleDeleteUser(selectedUser._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}