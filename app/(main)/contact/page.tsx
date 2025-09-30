"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24 hours.",
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-purple-600/20" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Get In Touch
            </h1>
            <p className="text-xl text-white/80 mb-8">
              Ready to start your adventure? We're here to help you plan the
              perfect Kenyan experience.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="glass rounded-xl p-6 flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Address</h3>
                    <p className="text-white/70">
                      Nairobi-Murang'a Highway
                      <br />
                      Kenya
                    </p>
                  </div>
                </div>

                <div className="glass rounded-xl p-6 flex items-start gap-4">
                  <Phone className="w-6 h-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Phone</h3>
                    <p className="text-white/70">+254 700 000 000</p>
                  </div>
                </div>

                <div className="glass rounded-xl p-6 flex items-start gap-4">
                  <Mail className="w-6 h-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Email</h3>
                    <p className="text-white/70">info@kujatwende.com</p>
                  </div>
                </div>

                <div className="glass rounded-xl p-6 flex items-start gap-4">
                  <Clock className="w-6 h-6 text-cyan-400 mt-1" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">
                      Business Hours
                    </h3>
                    <p className="text-white/70">
                      Monday - Friday: 8:00 AM - 6:00 PM
                      <br />
                      Saturday: 9:00 AM - 4:00 PM
                      <br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-4">
                <div className="glass rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-2">
                    How far in advance should I book?
                  </h3>
                  <p className="text-white/70 text-sm">
                    We recommend booking at least 2-4 weeks in advance,
                    especially during peak seasons (July-October).
                  </p>
                </div>

                <div className="glass rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-2">
                    What's included in the packages?
                  </h3>
                  <p className="text-white/70 text-sm">
                    Most packages include accommodation, meals, transportation,
                    and guided activities. Specific inclusions vary by package.
                  </p>
                </div>

                <div className="glass rounded-xl p-6">
                  <h3 className="text-white font-semibold mb-2">
                    Do you offer custom packages?
                  </h3>
                  <p className="text-white/70 text-sm">
                    Yes! We specialize in creating personalized adventures
                    tailored to your preferences and budget.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="glass rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">
              Send us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-white/80 text-sm font-medium mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-white/80 text-sm font-medium mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-white/80 text-sm font-medium mb-2"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 transition-colors"
                    placeholder="+254 700 000 000"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-white/80 text-sm font-medium mb-2"
                  >
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-cyan-400 transition-colors"
                  >
                    <option value="">Select a subject</option>
                    <option value="booking">Booking Inquiry</option>
                    <option value="custom">Custom Package</option>
                    <option value="support">Customer Support</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-white/80 text-sm font-medium mb-2"
                >
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                  placeholder="Tell us about your dream adventure..."
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 py-3"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
