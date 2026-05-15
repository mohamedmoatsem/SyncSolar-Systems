import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";

const C = {
  bg: "#090e1a",
  card: "#0d1326",
  border: "#202940",
  muted: "#191f30",
  mutedFg: "#758ab0",
  text: "#eeeee8",
  primary: "#ff8c1a",
  secondary: "#00c8d8",
  error: "#f23030",
  success: "#22c55e",
  input: "#131b2e",
};

export default function RegisterScreen() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleRegister = async () => {
    setError("");

    if (!name.trim()) {
      setError("يرجى إدخال الاسم الكامل");
      return;
    }
    if (!email.trim()) {
      setError("يرجى إدخال البريد الإلكتروني");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setError("البريد الإلكتروني غير صحيح");
      return;
    }
    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirmPassword) {
      setError("كلمة المرور وتأكيدها غير متطابقتين");
      return;
    }

    setLoading(true);
    try {
      await register(name.trim(), email.trim().toLowerCase(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message ?? "حدث خطأ، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.logoWrap}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={s.logo}
              resizeMode="contain"
            />
            <Text style={s.brand}>SyncSolar Systems</Text>
            <Text style={s.tagline}>منصة مراقبة الطاقة الشمسية</Text>
          </View>

          <View style={s.card}>
            <Text style={s.title}>إنشاء حساب جديد</Text>
            <Text style={s.subtitle}>أدخل بياناتك لإنشاء حساب في المنصة</Text>

            {/* Name */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>الاسم الكامل</Text>
              <TextInput
                style={s.input}
                placeholder="مثال: أحمد محمد"
                placeholderTextColor={C.mutedFg}
                value={name}
                onChangeText={setName}
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Email */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>البريد الإلكتروني</Text>
              <TextInput
                style={s.input}
                placeholder="example@email.com"
                placeholderTextColor={C.mutedFg}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            {/* Password */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>كلمة المرور</Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="6 أحرف على الأقل"
                  placeholderTextColor={C.mutedFg}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="next"
                />
                <Pressable style={s.eyeBtn} onPress={() => setShowPass((v) => !v)}>
                  <Text style={s.eyeText}>{showPass ? "إخفاء" : "إظهار"}</Text>
                </Pressable>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={s.fieldWrap}>
              <Text style={s.label}>تأكيد كلمة المرور</Text>
              <TextInput
                style={s.input}
                placeholder="أعد إدخال كلمة المرور"
                placeholderTextColor={C.mutedFg}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPass}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>

            {/* Password strength hint */}
            {password.length > 0 && (
              <View style={[s.strengthRow, { marginBottom: 8 }]}>
                {[1, 2, 3, 4].map((i) => (
                  <View
                    key={i}
                    style={[
                      s.strengthBar,
                      {
                        backgroundColor:
                          password.length >= i * 3
                            ? password.length >= 10 ? C.success
                            : password.length >= 6 ? C.primary
                            : C.error
                            : C.border,
                      },
                    ]}
                  />
                ))}
                <Text style={[s.strengthText, { color: C.mutedFg }]}>
                  {password.length < 6 ? "ضعيفة" : password.length < 10 ? "مقبولة" : "قوية"}
                </Text>
              </View>
            )}

            {!!error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.bg} size="small" />
              ) : (
                <Text style={s.btnText}>إنشاء الحساب</Text>
              )}
            </Pressable>

            <View style={s.divider} />

            <Pressable style={s.loginLink} onPress={() => router.replace("/(auth)/login")}>
              <Text style={s.loginLinkText}>لديك حساب بالفعل؟ </Text>
              <Text style={[s.loginLinkText, { color: C.primary, fontWeight: "700" }]}>
                سجّل الدخول
              </Text>
            </Pressable>
          </View>

          <Text style={s.footer}>© 2026 SyncSolar Systems</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, alignItems: "center", paddingHorizontal: 20, paddingVertical: 32 },

  logoWrap: { alignItems: "center", marginBottom: 32 },
  logo: { width: 80, height: 80, borderRadius: 16, marginBottom: 12 },
  brand: { fontSize: 22, fontWeight: "700", color: C.text, letterSpacing: 0.5 },
  tagline: { fontSize: 13, color: C.mutedFg, marginTop: 4 },

  card: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 24,
  },
  title: { fontSize: 20, fontWeight: "700", color: C.text, textAlign: "right", marginBottom: 4 },
  subtitle: { fontSize: 13, color: C.mutedFg, textAlign: "right", marginBottom: 24 },

  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, color: C.mutedFg, textAlign: "right", marginBottom: 6, fontWeight: "500" },
  input: {
    backgroundColor: C.input,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: C.text,
    fontSize: 15,
    textAlign: "right",
  },
  passwordRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: {
    backgroundColor: C.muted,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },
  eyeText: { color: C.mutedFg, fontSize: 12, fontWeight: "500" },

  strengthRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2 },
  strengthText: { fontSize: 11, marginLeft: 6 },

  errorBox: {
    backgroundColor: "rgba(242,48,48,0.12)",
    borderWidth: 1,
    borderColor: C.error,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  errorText: { color: C.error, fontSize: 13, textAlign: "right" },

  btn: {
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: C.bg, fontSize: 16, fontWeight: "700" },

  divider: { height: 1, backgroundColor: C.border, marginVertical: 20 },

  loginLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginLinkText: { color: C.mutedFg, fontSize: 14 },

  footer: { color: C.mutedFg, fontSize: 11, marginTop: 24, textAlign: "center" },
});
