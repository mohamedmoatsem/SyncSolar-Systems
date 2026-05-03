import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { useLanguage } from "@/contexts/LanguageContext";
import { OfflineBanner } from "@/components/OfflineBanner";

export default function TabLayout() {
  const colors = useColors();
  const { t } = useLanguage();
  const isIOS = Platform.OS === "ios";

  return (
    <View style={{ flex: 1 }}>
      <OfflineBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: {
            position: "absolute",
            backgroundColor: isIOS ? "transparent" : colors.background,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 0,
            ...(Platform.OS === "web" ? { height: 64 } : {}),
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
          },
          tabBarBackground: () =>
            isIOS ? (
              <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
            ) : null,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t.dashboard,
            tabBarIcon: ({ color }) => <Feather name="home" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="monitoring"
          options={{
            title: t.monitoring,
            tabBarIcon: ({ color }) => <Feather name="activity" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="devices"
          options={{
            title: t.devices,
            tabBarIcon: ({ color }) => <Feather name="cpu" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: t.alerts,
            tabBarIcon: ({ color }) => <Feather name="bell" size={22} color={color} />,
          }}
        />
        <Tabs.Screen
          name="ai"
          options={{
            title: t.aiAssistant,
            tabBarIcon: ({ color }) => <Feather name="message-circle" size={22} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
