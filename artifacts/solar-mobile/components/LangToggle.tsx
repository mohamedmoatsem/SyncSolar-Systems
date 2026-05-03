import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { useLanguage } from "@/contexts/LanguageContext";
import { useColors } from "@/hooks/useColors";

export function LangToggle() {
  const { lang, toggleLang } = useLanguage();
  const colors = useColors();

  return (
    <TouchableOpacity
      style={[styles.btn, { backgroundColor: colors.muted, borderColor: colors.border }]}
      onPress={toggleLang}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Toggle language"
    >
      <Text style={[styles.text, { color: colors.primary }]}>
        {lang === "ar" ? "EN" : "عر"}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
