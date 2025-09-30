"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Save, User, Bell, Lock, Globe } from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "general", label: "General", icon: Globe },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-white">Settings</h2>
        <p className="text-slate-400 mt-1">
          Manage your account and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Tabs */}
        <Card className="bg-slate-800/50 border-slate-700/50 lg:col-span-1">
          <CardContent className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-cyan-400/20 to-purple-600/20 text-white border border-cyan-400/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-700/30"
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
          {activeTab === "profile" && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Profile Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Update your profile information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter phone number"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">
                  Notification Settings
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      Email Notifications
                    </p>
                    <p className="text-slate-400 text-sm">
                      Receive email updates about bookings
                    </p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">Booking Alerts</p>
                    <p className="text-slate-400 text-sm">
                      Get notified when new bookings are made
                    </p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                  <div>
                    <p className="text-white font-medium">
                      Payment Notifications
                    </p>
                    <p className="text-slate-400 text-sm">
                      Receive alerts for payment transactions
                    </p>
                  </div>
                  <input type="checkbox" className="w-5 h-5" defaultChecked />
                </div>
                <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">Security Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          )}

          {activeTab === "general" && (
            <Card className="bg-slate-800/50 border-slate-700/50">
              <CardHeader>
                <CardTitle className="text-white">General Settings</CardTitle>
                <CardDescription className="text-slate-400">
                  Configure general application settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Company Name
                  </label>
                  <input
                    type="text"
                    defaultValue="Kuja Twende Adventures"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="contact@kujatwende.com"
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Timezone
                  </label>
                  <select className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-cyan-400">
                    <option>East Africa Time (EAT)</option>
                    <option>UTC</option>
                    <option>GMT</option>
                  </select>
                </div>
                <Button className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
