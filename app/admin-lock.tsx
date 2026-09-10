import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { Card, PrimaryButton, ScreenHeader } from "@/components/transport-ui";
import { useColors } from "@/hooks/use-colors";

const DEMO_ADMIN_PIN = "2468";

export default function AdminLockScreen() {
  const colors = useColors();
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const unlock = () => {
    if (pin === DEMO_ADMIN_PIN) {
      setError("");
      router.replace("/admin");
    } else {
      setError("Incorrect PIN. Try the demo PIN shown below.");
    }
  };
  return <ScreenContainer className="px-5" edges={["top", "left", "right"]}><ScreenHeader title="Admin access" subtitle="Restricted fleet management" /><View className="flex-1 justify-center"><Card><View style={{ backgroundColor: colors.warningSoft }} className="mx-auto h-16 w-16 items-center justify-center rounded-2xl"><MaterialIcons name="lock" size={30} color={colors.warning} /></View><Text className="mt-5 text-center text-2xl font-black text-foreground">Locked area</Text><Text className="mt-2 text-center text-sm leading-5 text-muted">Only authorized operators can add, edit, or remove buses.</Text><TextInput autoFocus value={pin} onChangeText={(value) => { setPin(value.replace(/\D/g, "").slice(0, 4)); setError(""); }} keyboardType="number-pad" secureTextEntry placeholder="Enter 4-digit admin PIN" placeholderTextColor={colors.muted} className="mt-6 h-14 rounded-2xl border border-border bg-background px-4 text-center text-lg font-black tracking-[8px] text-foreground" onSubmitEditing={unlock} /><PrimaryButton title="Unlock admin" icon="lock-open" onPress={unlock} style={{ marginTop: 14 }} />{error ? <Text style={{ color: colors.error }} className="mt-3 text-center text-xs font-bold">{error}</Text> : null}<View style={{ backgroundColor: colors.primarySoft }} className="mt-5 rounded-2xl px-4 py-3"><Text style={{ color: colors.primary }} className="text-center text-xs font-bold">Demo PIN: 2468</Text><Text className="mt-1 text-center text-[10px] text-muted">Replace this local demo gate with secure backend authentication before production.</Text></View></Card><Pressable onPress={() => router.back()} className="mt-5 items-center"><Text style={{ color: colors.primary }} className="font-bold">Back to passenger app</Text></Pressable></View></ScreenContainer>;
}
