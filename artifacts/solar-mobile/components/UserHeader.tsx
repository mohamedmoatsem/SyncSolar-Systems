import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { SystemPicker } from "./SystemPicker";

const C = {
  bg: "#090e1a",
  card: "#0d1326",
  border: "#202940",
  muted: "#191f30",
  mutedFg: "#758ab0",
  text: "#eeeee8",
  primary: "#ff8c1a",
  secondary: "#00c8d8",
};

export function UserHeader() {
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل تريد تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "خروج",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  if (!user) return null;

  const roleLabel = user.role === "technician" ? "فني" : "عميل";
  const roleColor = user.role === "technician" ? C.secondary : C.primary;

  return (
    <View style={[s.bar, { paddingTop: insets.top + 8 }]}>
      <Pressable style={s.logoutBtn} onPress={handleLogout}>
        <Feather name="log-out" size={16} color={C.mutedFg} />
      </Pressable>

      <View style={s.center}>
        <SystemPicker />
      </View>

      <View style={s.userInfo}>
        <Text style={s.userName} numberOfLines={1}>{user.name}</Text>
        <View style={[s.roleBadge, { borderColor: roleColor }]}>
          <Text style={[s.roleText, { color: roleColor }]}>{roleLabel}</Text>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#202940",
    backgroundColor: "#090e1a",
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#131b2e",
  },
  center: { flex: 1, alignItems: "center" },
  userInfo: { alignItems: "flex-end", maxWidth: 140 },
  userName: { color: C.text, fontSize: 13, fontWeight: "600" },
  roleBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 1,
    marginTop: 2,
  },
  roleText: { fontSize: 10, fontWeight: "700" },
});
