import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sun, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { isRTL } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#090e1a", direction: isRTL ? "rtl" : "ltr" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,140,26,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "linear-gradient(135deg, #ff8c1a, #ff6b00)" }}
          >
            <Sun className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Sync Solar System</h1>
          <p className="text-sm mt-1" style={{ color: "#758ab0" }}>
            منصة مراقبة الطاقة الشمسية
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-8"
          style={{ background: "#0d1326", borderColor: "#202940" }}
        >
          <h2 className="text-xl font-bold text-white mb-1 text-right">تسجيل الدخول</h2>
          <p className="text-sm mb-6 text-right" style={{ color: "#758ab0" }}>
            أدخل بياناتك للوصول إلى لوحة التحكم
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-right block text-sm" style={{ color: "#758ab0" }}>
                البريد الإلكتروني
              </Label>
              <Input
                type="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                dir="ltr"
                style={{
                  background: "#131b2e",
                  borderColor: "#202940",
                  color: "#eeeee8",
                  textAlign: "left",
                }}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-right block text-sm" style={{ color: "#758ab0" }}>
                كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{
                    background: "#131b2e",
                    borderColor: "#202940",
                    color: "#eeeee8",
                    paddingLeft: "40px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 rounded-lg p-3 text-sm text-right"
                style={{ background: "rgba(242,48,48,0.1)", border: "1px solid #f23030", color: "#f87171" }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full font-bold text-base py-5 mt-2"
              style={{
                background: loading ? "#7a4410" : "linear-gradient(135deg, #ff8c1a, #ff6b00)",
                color: "#090e1a",
                border: "none",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جارٍ التحقق...
                </span>
              ) : (
                "دخول"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "#202940" }}>
            <span className="text-sm" style={{ color: "#758ab0" }}>
              ليس لديك حساب؟{" "}
            </span>
            <button
              onClick={() => navigate("/register")}
              className="text-sm font-bold transition-colors hover:opacity-80"
              style={{ color: "#ff8c1a" }}
            >
              إنشاء حساب جديد
            </button>
          </div>
        </div>

        {/* Demo hint */}
        <div
          className="mt-4 rounded-xl border p-4 text-center"
          style={{ background: "rgba(0,200,216,0.05)", borderColor: "rgba(0,200,216,0.2)" }}
        >
          <p className="text-xs mb-2 font-semibold" style={{ color: "#00c8d8" }}>
            حسابات تجريبية
          </p>
          <p className="text-xs" style={{ color: "#758ab0" }}>
            فني: <span style={{ color: "#eeeee8" }}>tech@syncsolar.com</span> / tech1234
          </p>
          <p className="text-xs mt-1" style={{ color: "#758ab0" }}>
            عميل: <span style={{ color: "#eeeee8" }}>client@syncsolar.com</span> / client1234
          </p>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#4a5568" }}>
          © 2026 Sync Solar System
        </p>
      </div>
    </div>
  );
}
