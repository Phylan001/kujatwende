"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, User, Lock, Trash2, AlertCircle } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UserSettingsPage() {
  const { user, loading: authLoading, logout, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [securityData, setSecurityData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchUserProfile = async () => {
    try {
      const response = await fetch("/api/user/users/me", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setProfileData({
          name: userData.name || "",
          email: userData.email || "",
          phone: userData.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Error",
        description: "Failed to load user profile data",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    const loadUserData = async () => {
      await fetchUserProfile();
      setLoading(false);
    };

    loadUserData();
  }, [user, authLoading, router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const hasChanges = 
      profileData.name !== user?.name || 
      profileData.email !== user?.email || 
      profileData.phone !== (user as any)?.phone;

    if (!hasChanges) {
      toast({
        title: "No changes",
        description: "No changes were made to your profile.",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/user/users/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully.",
        });
        
        if (result.user && updateUser) {
          updateUser(result.user);
        }
        
        await fetchUserProfile();
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update profile");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (securityData.newPassword !== securityData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match.",
        variant: "destructive",
      });
      setSaving(false);
      return;
    }

    try {
      const response = await fetch("/api/user/users/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          currentPassword: securityData.currentPassword,
          newPassword: securityData.newPassword,
        }),
      });

      if (response.ok) {
        toast({
          title: "Password updated",
          description: "Your password has been updated successfully.",
        });
        setSecurityData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to update password");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== user?.email) {
      toast({
        title: "Error",
        description: "Please type your email address to confirm deletion.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const response = await fetch("/api/user/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Account deleted",
          description: "Your account has been permanently deleted.",
        });
        logout();
        router.push("/");
      } else {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete account");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
      setDeleteDialogOpen(false);
      setDeleteConfirm("");
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Lock },
  ];

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-orange-400 mx-auto"></div>
          <p className="text-white/70 mt-4">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Settings
          </h2>
          <p className="text-white/70 text-sm sm:text-base">
            Manage your account settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Mobile Tabs */}
          <div className="lg:hidden">
            <select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-white focus:outline-none focus:border-orange-400"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.label}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop Sidebar */}
          <Card className="bg-orange-500/10 border-orange-500/20 lg:col-span-1 hidden lg:block">
            <CardContent className="p-4">
              <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-orange-500/20 to-cyan-500/20 text-white border border-orange-500/30"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="bg-orange-500/10 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Profile Settings</CardTitle>
                  <CardDescription className="text-white/70">
                    Update your personal information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">
                          Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          value={profileData.name}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              name: e.target.value,
                            })
                          }
                          className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-orange-400"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              email: e.target.value,
                            })
                          }
                          className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-orange-400"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-white">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            phone: e.target.value,
                          })
                        }
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-orange-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="btn-adventure"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <Card className="bg-orange-500/10 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="text-white">Security Settings</CardTitle>
                  <CardDescription className="text-white/70">
                    Manage your account security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password Update */}
                  <form onSubmit={handlePasswordUpdate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-white">
                        Current Password
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={securityData.currentPassword}
                        onChange={(e) =>
                          setSecurityData({
                            ...securityData,
                            currentPassword: e.target.value,
                          })
                        }
                        placeholder="Enter current password"
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-orange-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white">
                        New Password
                      </Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={securityData.newPassword}
                        onChange={(e) =>
                          setSecurityData({
                            ...securityData,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="Enter new password"
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-orange-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">
                        Confirm New Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={securityData.confirmPassword}
                        onChange={(e) =>
                          setSecurityData({
                            ...securityData,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm new password"
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-orange-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={saving}
                      className="btn-adventure"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Updating..." : "Update Password"}
                    </Button>
                  </form>

                  {/* Account Deletion */}
                  <div className="border-t border-orange-500/20 pt-6">
                    <div className="space-y-3">
                      <h3 className="text-red-400 font-semibold text-lg">
                        Danger Zone
                      </h3>
                      <p className="text-white/70 text-sm">
                        Once you delete your account, there is no going back.
                        Please be certain.
                      </p>
                      <Button
                        onClick={() => setDeleteDialogOpen(true)}
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-400">Delete Account</DialogTitle>
            <DialogDescription className="text-slate-400">
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 font-medium text-sm">Warning</p>
              </div>
              <p className="text-white/80 text-xs">
                You will lose access to all your bookings and account data.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deleteConfirm" className="text-slate-300 text-sm">
                Type your email to confirm:{" "}
                <span className="font-medium">{user.email}</span>
              </Label>
              <Input
                id="deleteConfirm"
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="Enter your email"
                className="bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-red-400"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-700/50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteAccount}
              disabled={saving || deleteConfirm !== user.email}
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}