import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../../../store/AppContext";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Check, Zap, Crown, Shield, ArrowRight } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, accessToken, setUser } = useApp() as any;
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Dynamically load Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (tier: "PRO" | "PREMIUM") => {
    if (!accessToken) {
      navigate("/auth");
      return;
    }

    setLoadingTier(tier);
    setError("");

    try {
      // 1. Create order on backend
      const orderRes = await fetch("http://localhost:4000/api/subscriptions/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ tier }),
      });

      const orderData = await orderRes.json();
      if (!orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      const { id: order_id, amount, currency } = orderData.data.order;

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_YourTestKey", // Provide fallback or make sure env has it
        amount: amount,
        currency: currency,
        name: "Antigravity Interview Prep",
        description: `Upgrade to ${tier} Plan`,
        order_id: order_id,
        handler: async function (response: any) {
          // 3. Verify Payment
          try {
            const verifyRes = await fetch("http://localhost:4000/api/subscriptions/verify-payment", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              // Update user tier in context
              setUser((prev: any) => ({ ...prev, subscriptionTier: tier }));
              navigate("/dashboard");
            } else {
              setError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            setError("Error verifying payment.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#00E5FF", // match accent primary
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      setError(err.message || "An error occurred during checkout.");
    } finally {
      setLoadingTier(null);
    }
  };

  const isCurrentTier = (tier: string) => user?.subscriptionTier === tier;

  return (
    <div className="min-h-[80vh] py-12 px-4 flex flex-col items-center justify-center animate-fadeIn">
      <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Unlock Your Full <span className="text-[var(--accent-primary)]">Potential</span>
        </h1>
        <p className="text-lg text-gray-400">
          Supercharge your interview preparation with unlimited AI Mock Interviews, deep Resume Intelligence, and advanced stress simulations.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-950/40 border border-rose-500/20 text-rose-300 rounded-lg max-w-md w-full text-center text-sm font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        {/* Basic Tier */}
        <Card className="relative flex flex-col p-8 border-surface-border bg-surface-solid">
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-gray-200">Basic</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">Free</span>
            </div>
            <p className="text-sm text-gray-400">For getting started with interview preparation.</p>
          </div>
          
          <ul className="space-y-4 flex-grow mb-8 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <Check size={18} className="text-gray-500 mt-0.5 shrink-0" />
              <span>Basic coding environment</span>
            </li>
            <li className="flex items-start gap-3">
              <Check size={18} className="text-gray-500 mt-0.5 shrink-0" />
              <span>Standard difficulty questions</span>
            </li>
            <li className="flex items-start gap-3">
              <Check size={18} className="text-gray-500 mt-0.5 shrink-0" />
              <span>3 mock interviews per week</span>
            </li>
            <li className="flex items-start gap-3">
              <Check size={18} className="text-gray-500 mt-0.5 shrink-0" />
              <span>Limited analytics</span>
            </li>
          </ul>

          <Button
            variant="secondary"
            className="w-full justify-center"
            disabled={isCurrentTier("FREE") || !accessToken}
            onClick={() => navigate("/dashboard")}
          >
            {isCurrentTier("FREE") ? "Current Plan" : "Get Started"}
          </Button>
        </Card>

        {/* Pro Tier */}
        <Card className="relative flex flex-col p-8 border-[var(--accent-primary)]/50 bg-[rgba(var(--accent-rgb),0.02)] transform scale-105 shadow-[0_0_40px_rgba(var(--accent-rgb),0.15)] z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--accent-primary)] text-[var(--bg-color)] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            <Zap size={14} className="fill-current" /> Most Popular
          </div>
          
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-[var(--accent-primary)]">Pro</h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">₹999</span>
              <span className="text-gray-500 font-medium">/month</span>
            </div>
            <p className="text-sm text-gray-400">Accelerate your growth with AI feedback.</p>
          </div>
          
          <ul className="space-y-4 flex-grow mb-8 text-sm text-gray-200">
            <li className="flex items-start gap-3">
              <Check size={18} className="text-[var(--accent-primary)] mt-0.5 shrink-0" />
              <span>Unlimited mock interviews</span>
            </li>
            <li className="flex items-start gap-3">
              <Check size={18} className="text-[var(--accent-primary)] mt-0.5 shrink-0" />
              <span>Advanced AI Evaluation & Transcript generation</span>
            </li>
            <li className="flex items-start gap-3">
              <Check size={18} className="text-[var(--accent-primary)] mt-0.5 shrink-0" />
              <span>Resume Intelligence processing</span>
            </li>
            <li className="flex items-start gap-3">
              <Check size={18} className="text-[var(--accent-primary)] mt-0.5 shrink-0" />
              <span>Company-specific role targeting</span>
            </li>
          </ul>

          <Button
            variant="primary"
            className="w-full justify-center group"
            loading={loadingTier === "PRO"}
            disabled={isCurrentTier("PRO") || isCurrentTier("PREMIUM")}
            onClick={() => handleSubscribe("PRO")}
          >
            {isCurrentTier("PRO") ? "Current Plan" : "Upgrade to Pro"} 
            {!isCurrentTier("PRO") && <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </Card>

        {/* Premium Tier */}
        <Card className="relative flex flex-col p-8 border-surface-border bg-gradient-to-b from-surface-solid to-indigo-950/20">
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold flex items-center gap-2 text-indigo-400">
              <Crown size={20} className="text-indigo-400" /> Premium
            </h3>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-white">₹2499</span>
              <span className="text-gray-500 font-medium">/month</span>
            </div>
            <p className="text-sm text-gray-400">For the ultimate interview mastery.</p>
          </div>
          
          <ul className="space-y-4 flex-grow mb-8 text-sm text-gray-300">
            <li className="flex items-start gap-3">
              <Check size={18} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>Everything in Pro</span>
            </li>
            <li className="flex items-start gap-3">
              <Check size={18} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>Voice-active AI Interviewer Persona</span>
            </li>
            <li className="flex items-start gap-3">
              <Check size={18} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>Extreme Stress Simulation modes</span>
            </li>
            <li className="flex items-start gap-3">
              <Shield size={18} className="text-indigo-400 mt-0.5 shrink-0" />
              <span>Priority execution & queueing</span>
            </li>
          </ul>

          <Button
            variant="glow"
            className="w-full justify-center !border-indigo-500/50 hover:!bg-indigo-500/20 !text-indigo-300"
            loading={loadingTier === "PREMIUM"}
            disabled={isCurrentTier("PREMIUM")}
            onClick={() => handleSubscribe("PREMIUM")}
          >
            {isCurrentTier("PREMIUM") ? "Current Plan" : "Upgrade to Premium"}
          </Button>
        </Card>
      </div>
    </div>
  );
};
