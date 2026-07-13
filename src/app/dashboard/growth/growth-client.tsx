"use client";

import { useState } from "react";
import Image from "next/image";
import { Product } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingCart, TrendingUp, Sparkles, CheckCircle2, Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Script from "next/script";
import { useRouter } from "next/navigation";

interface GrowthClientProps {
  products: Product[];
  consultationFee: number;
  themeColor: string;
}

export function GrowthClient({ products, consultationFee, themeColor }: GrowthClientProps) {
  const router = useRouter();
  const [feeCalc, setFeeCalc] = useState(consultationFee || 500);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutProduct, setCheckoutProduct] = useState<Product | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleBuyClick = (product: Product) => {
    setCheckoutProduct(product);
    setIsDialogOpen(true);
  };

  const processPayment = async () => {
    if (!checkoutProduct) return;
    if (checkoutProduct.price > 0 && shippingAddress.trim() === "") {
      toast.error("Please provide a shipping address.");
      return;
    }

    setIsCheckingOut(true);
    
    try {
      // 1. Create order on our backend
      const res = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: checkoutProduct.id,
          quantity: 1,
          shippingAddress: shippingAddress,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create order");
      }

      // If price is 0 (Free Starter Kit), it might skip Razorpay
      if (data.isFree) {
        toast.success("Starter Kit claimed successfully! We will ship it soon.");
        setIsDialogOpen(false);
        setIsCheckingOut(false);
        router.refresh();
        return;
      }

      // 2. Initialize Razorpay Checkout
      const options = {
        key: data.razorpayKeyId, // Your Razorpay Key ID
        amount: data.amount,
        currency: "INR",
        name: "Clinic Diary",
        description: `Purchase of ${checkoutProduct.name}`,
        order_id: data.razorpayOrderId,
        handler: async function (response: any) {
          // 3. Verify payment on our backend
          const verifyRes = await fetch("/api/orders/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (verifyRes.ok) {
            toast.success("Payment successful! Your order is being processed.");
            setIsDialogOpen(false);
            router.refresh();
          } else {
            toast.error(verifyData.error || "Payment verification failed.");
          }
        },
        prefill: {
          name: "Doctor",
          email: "",
          contact: "",
        },
        theme: {
          color: themeColor,
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        toast.error("Payment failed. Please try again.");
      });
      rzp.open();

    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const getMonthlyROI = (priceInPaise: number) => {
    // Assume 1 extra scan per day = 30 scans/month. 
    // Assume 30% conversion rate = 10 extra bookings/month.
    const price = priceInPaise / 100;
    if (price === 0) return 0;
    const extraRevenue = 10 * feeCalc;
    const profit = extraRevenue - price;
    const roi = (profit / price) * 100;
    return Math.round(roi);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      {/* ROI Calculator Section - The "Wow" Factor */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 md:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <TrendingUp className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
              <Calculator className="w-6 h-6 text-emerald-400" />
              The ROI of Visibility
            </h3>
            <p className="text-slate-300 mb-6 max-w-md">
              Physical assets bridge the gap between offline foot traffic and your digital booking system. See how fast they pay for themselves.
            </p>
            
            <div className="space-y-4 max-w-sm">
              <div className="space-y-2">
                <Label htmlFor="fee" className="text-slate-300">Your Average Consultation Fee (₹)</Label>
                <Input 
                  id="fee"
                  type="number" 
                  value={feeCalc} 
                  onChange={(e) => setFeeCalc(Number(e.target.value) || 0)}
                  className="bg-slate-800/50 border-slate-700 text-white font-medium text-lg focus-visible:ring-emerald-500"
                />
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10">
            <h4 className="text-sm font-medium text-emerald-400 uppercase tracking-wider mb-4">Projected Monthly Impact</h4>
            <div className="space-y-6">
              <div>
                <p className="text-sm text-slate-300 mb-1">Assuming just 10 extra bookings/month via QR assets:</p>
                <div className="text-4xl font-bold font-mono text-white tracking-tight">
                  +₹{(feeCalc * 10).toLocaleString()}
                </div>
                <p className="text-sm text-slate-400 mt-1">in additional monthly revenue.</p>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-sm text-slate-300 mb-2">Average ROI on ₹999 Acrylic Stand:</p>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold text-lg">
                  <Sparkles className="w-4 h-4" />
                  {getMonthlyROI(99900)}% ROI
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const price = product.price / 100;
          const isFree = price === 0;

          return (
            <Card key={product.id} className={`flex flex-col overflow-hidden transition-all hover:shadow-lg ${isFree ? 'border-emerald-200 ring-1 ring-emerald-500/20' : ''}`}>
              <div className="aspect-[4/3] relative bg-slate-100">
                {product.imageUrl ? (
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    No Image
                  </div>
                )}
                {isFree && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                    FREE KIT
                  </div>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="text-xl">{product.name}</CardTitle>
                <CardDescription className="line-clamp-2 mt-2 leading-relaxed">
                  {product.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="mt-auto">
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold tracking-tight text-slate-900">
                    {isFree ? "₹0" : `₹${price.toLocaleString()}`}
                  </span>
                  {!isFree && <span className="text-sm text-muted-foreground mb-1">one-time</span>}
                </div>
              </CardContent>
              
              <CardFooter>
                <Button 
                  className="w-full font-semibold" 
                  size="lg"
                  variant={isFree ? "default" : "outline"}
                  style={isFree ? { backgroundColor: themeColor } : { borderColor: themeColor, color: themeColor }}
                  onClick={() => handleBuyClick(product)}
                >
                  {isFree ? "Claim Free Kit" : "Buy Now"}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Checkout Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{checkoutProduct?.price === 0 ? "Claim Starter Kit" : "Checkout"}</DialogTitle>
            <DialogDescription>
              You are {checkoutProduct?.price === 0 ? "claiming" : "purchasing"}: <strong>{checkoutProduct?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-lg border">
              <span className="font-medium text-slate-700">Total Amount:</span>
              <span className="text-2xl font-bold">
                ₹{((checkoutProduct?.price || 0) / 100).toLocaleString()}
              </span>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shipping">Shipping Address</Label>
              <Textarea 
                id="shipping" 
                placeholder="Enter your full clinic address, landmark, and pincode for delivery."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                required
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              By proceeding, you agree that physical items are custom-printed with your clinic's tracking URL and usually ship within 3-5 business days.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              disabled={isCheckingOut || !shippingAddress.trim()} 
              onClick={processPayment}
              className="w-full"
              style={{ backgroundColor: themeColor }}
            >
              {isCheckingOut ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
              ) : checkoutProduct?.price === 0 ? (
                "Complete Claim"
              ) : (
                `Pay ₹${((checkoutProduct?.price || 0) / 100).toLocaleString()}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
