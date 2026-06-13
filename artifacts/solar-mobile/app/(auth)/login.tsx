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
  input: "#131b2e",
};

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <Text style={s.title}>تسجيل الدخول</Text>
            <Text style={s.subtitle}>أدخل بياناتك للوصول إلى لوحة التحكم</Text>

            <View style={s.fieldWrap}>
              <Text style={s.label}>البريد الإلكتروني</Text>
              <TextInput
                style={s.input}
                placeholder="example@syncsolar.com"
                placeholderTextColor={C.mutedFg}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={s.fieldWrap}>
              <Text style={s.label}>كلمة المرور</Text>
              <View style={s.passwordRow}>
                <TextInput
                  style={[s.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="••••••••"
                  placeholderTextColor={C.mutedFg}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <Pressable style={s.eyeBtn} onPress={() => setShowPass((v) => !v)}>
                  <Text style={s.eyeText}>{showPass ? "إخفاء" : "إظهار"}</Text>
                </Pressable>
              </View>
            </View>

            {!!error && (
              <View style={s.errorBox}>
                <Text style={s.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={C.bg} size="small" />
              ) : (
                <Text style={s.btnText}>دخول</Text>
              )}
            </Pressable>

            <View style={s.divider} />

            <View style={s.demoWrap}>
              <Text style={s.demoTitle}>حسابات تجريبية</Text>
              <DemoBtn
                label="فني — tech@syncsolar.com"
                sub="tech1234"
                onPress={() => { setEmail("tech@syncsolar.com"); setPassword("tech1234"); }}
              />
              <DemoBtn
                label="عميل — client@syncsolar.com"
                sub="client1234"
                onPress={() => { setEmail("client@syncsolar.com"); setPassword("client1234"); }}
              />
            </View>
          </View>

          <Pressable style={s.registerLink} onPress={() => router.replace("/(auth)/register")}>
            <Text style={s.registerLinkText}>ليس لديك حساب؟ </Text>
            <Text style={[s.registerLinkText, { color: C.primary, fontWeight: "700" }]}>
              إنشاء حساب جديد
            </Text>
          </Pressable>

          <Text style={s.footer}>© 2026 SyncSolar Systems</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DemoBtn({ label, sub, onPress }: { label: string; sub: string; onPress: () => void }) {
  return (
    <Pressable style={s.demoBtn} onPress={onPress}>
      <Text style={s.demoBtnLabel}>{label}</Text>
      <Text style={s.demoBtnSub}>{sub}</Text>
    </Pressable>
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

  demoWrap: { gap: 8 },
  demoTitle: { fontSize: 12, color: C.mutedFg, textAlign: "center", marginBottom: 4 },
  demoBtn: {
    backgroundColor: C.muted,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  demoBtnLabel: { color: C.text, fontSize: 12, flex: 1, textAlign: "right" },
  demoBtnSub: { color: C.secondary, fontSize: 12, marginLeft: 8, fontWeight: "600" },

  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  registerLinkText: { color: C.mutedFg, fontSize: 14 },

  footer: { color: C.mutedFg, fontSize: 11, marginTop: 16, textAlign: "center" },
});
