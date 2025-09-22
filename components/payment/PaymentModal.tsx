"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, Smartphone, Building, CheckCircle, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Booking } from "@/lib/models/Booking"

interface PaymentModalProps {
  booking: Booking
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ booking, onClose, onSuccess }: PaymentModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [paymentStatus, setPaymentStatus] = useState<"idle" | "processing" | "success" | "failed">("idle")

  // M-Pesa form
  const [phoneNumber, setPhoneNumber] = useState("")

  // Card form
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })

  const handleMpesaPayment = async () => {
    if (!phoneNumber) {
      toast({
        title: "Phone number required",
        description: "Please enter your M-Pesa phone number.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setPaymentStatus("processing")

    try {
      const response = await fetch("/api/payments/mpesa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          bookingId: booking._id,
          phoneNumber,
          amount: booking.totalAmount,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentStatus("success")
        toast({
          title: "Payment initiated!",
          description: data.message,
        })

        // Poll for payment status
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 5000)
      } else {
        setPaymentStatus("failed")
        toast({
          title: "Payment failed",
          description: data.error || "Unable to process M-Pesa payment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setPaymentStatus("failed")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCardPayment = async () => {
    if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv || !cardDetails.name) {
      toast({
        title: "Card details required",
        description: "Please fill in all card details.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setPaymentStatus("processing")

    try {
      const response = await fetch("/api/payments/card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          bookingId: booking._id,
          cardDetails,
          amount: booking.totalAmount,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setPaymentStatus("success")
        toast({
          title: "Payment successful!",
          description: data.message,
        })

        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      } else {
        setPaymentStatus("failed")
        toast({
          title: "Payment failed",
          description: data.message || "Unable to process card payment.",
          variant: "destructive",
        })
      }
    } catch (error) {
      setPaymentStatus("failed")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ""
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(" ")
    } else {
      return v
    }
  }

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
    if (v.length >= 2) {
      return v.substring(0, 2) + "/" + v.substring(2, 4)
    }
    return v
  }

  if (paymentStatus === "success") {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md glass border-white/10">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">Payment Successful!</h3>
            <p className="text-white/70 mb-6">
              Your booking has been confirmed. You will receive a confirmation email shortly.
            </p>
            <Button
              onClick={() => {
                onSuccess()
                onClose()
              }}
              className="bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  if (paymentStatus === "processing") {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-md glass border-white/10">
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-2xl font-bold text-white mb-2">Processing Payment</h3>
            <p className="text-white/70 mb-6">
              {paymentMethod === "mpesa"
                ? "Please check your phone for the M-Pesa prompt and enter your PIN."
                : "Processing your card payment. Please wait..."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            Complete Payment
          </DialogTitle>
          <DialogDescription className="text-white/70">Secure payment for your booking</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card className="glass border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-lg">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-white/80">
                <span>Booking ID:</span>
                <span>#{booking._id?.toString().slice(-6)}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Travelers:</span>
                <span>{booking.numberOfTravelers}</span>
              </div>
              <div className="flex justify-between text-white/80">
                <span>Travel Date:</span>
                <span>{new Date(booking.travelDate).toLocaleDateString()}</span>
              </div>
              <div className="border-t border-white/20 pt-2">
                <div className="flex justify-between text-lg font-bold text-cyan-400">
                  <span>Total Amount:</span>
                  <span>KSh {booking.totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
            <TabsList className="grid w-full grid-cols-3 bg-white/10 border-white/20">
              <TabsTrigger
                value="mpesa"
                className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
              >
                <Smartphone className="w-4 h-4 mr-2" />
                M-Pesa
              </TabsTrigger>
              <TabsTrigger
                value="card"
                className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Card
              </TabsTrigger>
              <TabsTrigger
                value="bank"
                className="text-white data-[state=active]:bg-cyan-400 data-[state=active]:text-black"
              >
                <Building className="w-4 h-4 mr-2" />
                Bank
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mpesa" className="space-y-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-green-500" />
                    M-Pesa Payment
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Pay securely using your M-Pesa mobile money account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80">Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                    />
                  </div>
                  <Button
                    onClick={handleMpesaPayment}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4 mr-2" />
                        Pay with M-Pesa
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="card" className="space-y-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-500" />
                    Card Payment
                  </CardTitle>
                  <CardDescription className="text-white/70">Pay with your credit or debit card</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-white/80">Cardholder Name</Label>
                    <Input
                      placeholder="John Doe"
                      value={cardDetails.name}
                      onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">Card Number</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardDetails.number}
                      onChange={(e) => setCardDetails({ ...cardDetails, number: formatCardNumber(e.target.value) })}
                      maxLength={19}
                      className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/80">Expiry Date</Label>
                      <Input
                        placeholder="MM/YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: formatExpiry(e.target.value) })}
                        maxLength={5}
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">CVV</Label>
                      <Input
                        placeholder="123"
                        value={cardDetails.cvv}
                        onChange={(e) =>
                          setCardDetails({ ...cardDetails, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })
                        }
                        maxLength={4}
                        className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleCardPayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay KSh {booking.totalAmount.toLocaleString()}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bank" className="space-y-4">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-purple-500" />
                    Bank Transfer
                  </CardTitle>
                  <CardDescription className="text-white/70">Pay via direct bank transfer</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Building className="w-12 h-12 text-white/30 mx-auto mb-4" />
                    <p className="text-white/70">Bank transfer payment option coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
