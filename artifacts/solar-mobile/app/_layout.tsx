import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { dehydrate, hydrate } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LanguageProvider } from "@/contexts/LanguageContext";

SplashScreen.preventAutoHideAsync().catch(() => {});

const CACHE_KEY = "solar-scada-rq-cache";
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      gcTime: CACHE_MAX_AGE,
      networkMode: "always",
    },
    mutations: {
      networkMode: "always",
    },
  },
});

async function restoreCache() {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const { data, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > CACHE_MAX_AGE) return;
    hydrate(queryClient, data);
  } catch {}
}

export default function RootLayout() {
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    restoreCache().catch(() => {});

    const unsubscribe = queryClient.getQueryCache().subscribe(() => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        try {
          const data = dehydrate(queryClient);
          await AsyncStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ data, savedAt: Date.now() })
          );
        } catch {}
      }, 3000);
    });

    SplashScreen.hideAsync().catch(() => {});

    return () => {
      unsubscribe();
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#090e1a" }}>
              <KeyboardProvider>
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </KeyboardProvider>
            </GestureHandlerRootView>
          </LanguageProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
