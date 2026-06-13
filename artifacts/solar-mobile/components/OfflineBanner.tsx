import React, { useEffect, useRef } from "react";
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

const BANNER_HEIGHT = 36;

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
        useNativeDriver: false,
      }).start();
    } else if (wasOffline.current) {
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 200, useNativeDriver: false }),
        Animated.delay(2000),
        Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: false }),
      ]).start(() => {
        wasOffline.current = false;
      });
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  }, [isOnline]);

  const height = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BANNER_HEIGHT],
  });

  return (
    <Animated.View
      style={[styles.wrapper, { height, backgroundColor: bgColor }]}
      pointerEvents="none"
    >
      <View style={styles.inner}>
        <Feather
          name={isOnline ? "wifi" : "wifi-off"}
          size={13}
          color="#fff"
        />
        <Text style={styles.text}>{label}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    width: "100%",
  },
  inner: {
    height: BANNER_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
  },
  text: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});
