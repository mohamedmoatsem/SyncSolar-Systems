import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

interface Props {
  dataUpdatedAt?: number;
}

export function CachedBadge({ dataUpdatedAt }: Props) {
  const colors = useColors();
  const { lang } = useLanguage();
  const isOnline = useNetworkStatus();

  if (isOnline || !dataUpdatedAt) return null;

  const d = new Date(dataUpdatedAt);
  const time = d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const label =
    lang === "ar" ? `بيانات محفوظة · ${time}` : `Cached · ${time}`;

  return (
    <View style={[styles.badge, { backgroundColor: colors.warning + "22", borderColor: colors.warning + "55" }]}>
      <Feather name="clock" size={10} color={colors.warning} />
      <Text style={[styles.text, { color: colors.warning }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  text: { fontSize: 10, fontWeight: "600" },
});
