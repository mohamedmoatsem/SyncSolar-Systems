import React, { useEffect, useRef } from "react";
import {
  Animated,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

export function OfflineBanner() {
  const colors = useColors();
  const { lang } = useLanguage();
  const isOnline = useNetworkStatus();
  const anim = useRef(new Animated.Value(0)).current;
  const wasOffline = useRef(false);

  const label =
    isOnline && wasOffline.current
      ? lang === "ar"
        ? "✓ تمت استعادة الاتصال"
        : "✓ Connection restored"
      : lang === "ar"
      ? "لا يوجد اتصال — يُعرض آخر بيانات محفوظة"
      : "Offline — showing cached data";

  const bgColor = isOnline && wasOffline.current ? colors.success : colors.warning;

  useEffect(() => {
    if (!isOnline) {
      wasOffline.current = true;
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else if (wasOffline.current) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        wasOffline.current = false;
      });
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [isOnline]);

  return (
    <Animated.View
      style={[
        styles.banner,
        { backgroundColor: bgColor, opacity: anim, transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [-40, 0] }) }] },
      ]}
      pointerEvents="none"
    >
      <Feather
        name={isOnline ? "wifi" : "wifi-off"}
        size={13}
        color="#fff"
      />
      <Text style={styles.text}>{label}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: "absolute",
    top: Platform.OS === "web" ? 0 : 0,
    left: 0,
    right: 0,
    zIndex: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
