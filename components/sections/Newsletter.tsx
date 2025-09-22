"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, Send } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast({
        title: "Email required",
        description: "Please enter your email address.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    // Simulate newsletter signup
    setTimeout(() => {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      })
      setEmail("")
      setLoading(false)
    }, 1000)
  }

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <Card className="glass border-white/10 max-w-4xl mx-auto animate-fade-scale">
          <CardContent className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
                Stay Updated
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Get the latest travel deals, destination guides, and adventure stories delivered to your inbox
              </p>
            </div>

            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700 px-8"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Subscribe
                    </>
                  )}
                </Button>
              </div>
            </form>

            <div className="flex items-center justify-center gap-8 mt-8 pt-8 border-t border-white/10">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400 mb-1">Weekly</div>
                <div className="text-white/70 text-sm">Travel Tips</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">Exclusive</div>
                <div className="text-white/70 text-sm">Deals</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-400 mb-1">Early</div>
                <div className="text-white/70 text-sm">Access</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
