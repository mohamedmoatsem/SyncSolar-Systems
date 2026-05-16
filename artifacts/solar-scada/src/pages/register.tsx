import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sun, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const { register } = useAuth();
  const [, navigate] = useLocation();
  const { isRTL } = useLanguage();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength =
    password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : 3;

  const strengthLabel = ["", "ضعيفة", "مقبولة", "قوية"][passwordStrength];
  const strengthColor = ["", "#f23030", "#ff8c1a", "#22c55e"][passwordStrength];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) { setError("يرجى إدخال الاسم الكامل"); return; }
    if (!email.includes("@") || !email.includes(".")) { setError("البريد الإلكتروني غير صحيح"); return; }
    if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    if (password !== confirmPassword) { setError("كلمة المرور وتأكيدها غير متطابقتين"); return; }

    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      navigate("/");
    } catch (err: any) {
      setError(err.message ?? "حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{ background: "#090e1a", direction: isRTL ? "rtl" : "ltr" }}
    >
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
          <h1 className="text-2xl font-bold text-white">SyncSolar Systems</h1>
          <p className="text-sm mt-1" style={{ color: "#758ab0" }}>
            منصة مراقبة الطاقة الشمسية
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl border p-8"
          style={{ background: "#0d1326", borderColor: "#202940" }}
        >
          <h2 className="text-xl font-bold text-white mb-1 text-right">إنشاء حساب جديد</h2>
          <p className="text-sm mb-6 text-right" style={{ color: "#758ab0" }}>
            أدخل بياناتك لإنشاء حساب في المنصة
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label className="text-right block text-sm" style={{ color: "#758ab0" }}>
                الاسم الكامل
              </Label>
              <Input
                placeholder="مثال: أحمد محمد"
                value={name}
                onChange={(e) => setName(e.target.value)}
                dir="rtl"
                style={{ background: "#131b2e", borderColor: "#202940", color: "#eeeee8" }}
              />
            </div>

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
                  placeholder="6 أحرف على الأقل"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="flex items-center gap-2 mt-1.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-1 flex-1 rounded-full transition-colors duration-300"
                      style={{
                        background: passwordStrength >= i ? strengthColor : "#202940",
                      }}
                    />
                  ))}
                  <span className="text-xs w-12 text-right" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label className="text-right block text-sm" style={{ color: "#758ab0" }}>
                تأكيد كلمة المرور
              </Label>
              <div className="relative">
                <Input
                  type={showPass ? "text" : "password"}
                  placeholder="أعد إدخال كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={{
                    background: "#131b2e",
                    borderColor:
                      confirmPassword && confirmPassword !== password
                        ? "#f23030"
                        : confirmPassword && confirmPassword === password
                          ? "#22c55e"
                          : "#202940",
                    color: "#eeeee8",
                    paddingLeft: "40px",
                  }}
                />
                {confirmPassword && (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    {confirmPassword === password ? (
                      <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                    ) : (
                      <AlertCircle className="w-4 h-4" style={{ color: "#f23030" }} />
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 rounded-lg p-3 text-sm"
                style={{ background: "rgba(242,48,48,0.1)", border: "1px solid #f23030", color: "#f87171" }}
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-right flex-1">{error}</span>
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
                  جارٍ إنشاء الحساب...
                </span>
              ) : (
                "إنشاء الحساب"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t text-center" style={{ borderColor: "#202940" }}>
            <span className="text-sm" style={{ color: "#758ab0" }}>
              لديك حساب بالفعل؟{" "}
            </span>
            <button
              onClick={() => navigate("/login")}
              className="text-sm font-bold transition-colors hover:opacity-80"
              style={{ color: "#ff8c1a" }}
            >
              تسجيل الدخول
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: "#4a5568" }}>
          © 2026 SyncSolar Systems
        </p>
      </div>
    </div>
  );
}
