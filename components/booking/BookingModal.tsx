"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, CreditCard, Phone, Mail, User } from "lucide-react"
import { format } from "date-fns"
import type { TravelPackage } from "@/lib/models/Package"
import { useToast } from "@/hooks/use-toast"
import { PaymentModal } from "@/components/payment/PaymentModal"

interface BookingModalProps {
  package: TravelPackage
  onClose: () => void
}

export function BookingModal({ package: pkg, onClose }: BookingModalProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [createdBooking, setCreatedBooking] = useState<any>(null)

  // Form data
  const [travelDate, setTravelDate] = useState<Date>()
  const [numberOfTravelers, setNumberOfTravelers] = useState(1)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    emergencyContact: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("mpesa")
  const [specialRequests, setSpecialRequests] = useState("")

  const totalAmount = pkg.price * numberOfTravelers

  const handleSubmit = async () => {
    if (!travelDate) {
      toast({
        title: "Date required",
        description: "Please select a travel date.",
        variant: "destructive",
      })
      return
    }

    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      toast({
        title: "Information required",
        description: "Please fill in all required customer information.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth-token")}`,
        },
        body: JSON.stringify({
          packageId: pkg._id,
          customerInfo,
          travelDate: travelDate.toISOString(),
          numberOfTravelers,
          totalAmount,
          paymentMethod,
          specialRequests,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setCreatedBooking(data.booking)
        setShowPaymentModal(true)
      } else {
        toast({
          title: "Booking failed",
          description: data.error || "Unable to create booking. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePaymentSuccess = () => {
    toast({
      title: "Booking confirmed!",
      description: "Your booking has been confirmed and payment processed successfully.",
    })
    onClose()
    router.push("/dashboard")
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
              Book Your Adventure
            </DialogTitle>
            <DialogDescription className="text-white/70">
              {pkg.title} - {pkg.destination}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Step Indicator */}
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= stepNum
                        ? "bg-gradient-to-r from-cyan-400 to-purple-600 text-white"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {stepNum}
                  </div>
                  {stepNum < 3 && (
                    <div
                      className={`w-12 h-0.5 mx-2 ${
                        step > stepNum ? "bg-gradient-to-r from-cyan-400 to-purple-600" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Travel Details */}
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Travel Details</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/80">Travel Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {travelDate ? format(travelDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-900 border-white/20">
                        <Calendar
                          mode="single"
                          selected={travelDate}
                          onSelect={setTravelDate}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Number of Travelers</Label>
                    <Select
                      value={numberOfTravelers.toString()}
                      onValueChange={(value) => setNumberOfTravelers(Number.parseInt(value))}
                    >
                      <SelectTrigger className="bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(pkg.maxGroupSize)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i === 0 ? "Person" : "People"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-white/80">Special Requests (Optional)</Label>
                  <Textarea
                    placeholder="Any special requirements or requests..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                  />
                </div>

                <Button
                  onClick={() => setStep(2)}
                  className="w-full bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                  disabled={!travelDate}
                >
                  Continue to Customer Info
                </Button>
              </div>
            )}

            {/* Step 2: Customer Information */}
            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Customer Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/80">Full Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                      <Input
                        placeholder="Enter full name"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                      <Input
                        type="email"
                        placeholder="Enter email address"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Phone Number *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                      <Input
                        placeholder="Enter phone number"
                        value={customerInfo.phone}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                        className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white/80">Emergency Contact</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cyan-400 w-5 h-5" />
                      <Input
                        placeholder="Emergency contact number"
                        value={customerInfo.emergencyContact}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, emergencyContact: e.target.value })}
                        className="pl-12 bg-white/10 border-white/20 text-white placeholder-white/60 focus:border-cyan-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    className="flex-1 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                    disabled={!customerInfo.name || !customerInfo.email || !customerInfo.phone}
                  >
                    Continue to Payment
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: Payment & Confirmation */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Payment & Confirmation</h3>

                {/* Booking Summary */}
                <Card className="glass border-white/10">
                  <CardHeader>
                    <CardTitle className="text-white">Booking Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between text-white/80">
                      <span>Package:</span>
                      <span>{pkg.title}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Travel Date:</span>
                      <span>{travelDate ? format(travelDate, "PPP") : "Not selected"}</span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Travelers:</span>
                      <span>
                        {numberOfTravelers} {numberOfTravelers === 1 ? "person" : "people"}
                      </span>
                    </div>
                    <div className="flex justify-between text-white/80">
                      <span>Price per person:</span>
                      <span>KSh {pkg.price.toLocaleString()}</span>
                    </div>
                    <div className="border-t border-white/20 pt-3">
                      <div className="flex justify-between text-lg font-bold text-cyan-400">
                        <span>Total Amount:</span>
                        <span>KSh {totalAmount.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label className="text-white/80">Payment Method</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger className="bg-white/10 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => setStep(2)}
                    className="flex-1 border-white/20 text-white hover:bg-white/10"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-500 hover:to-purple-700"
                    disabled={loading}
                  >
                    <CreditCard className="w-5 h-5 mr-2" />
                    {loading ? "Processing..." : "Confirm Booking"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      {showPaymentModal && createdBooking && (
        <PaymentModal
          booking={createdBooking}
          onClose={() => {
            setShowPaymentModal(false)
            onClose()
          }}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </>
  )
}
