import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View, type ViewStyle } from "react-native";
import { useColors } from "@/hooks/use-colors";

export function Card({ children, style, className = "" }: { children: React.ReactNode; style?: ViewStyle; className?: string }) {
  return <View style={style} className={`rounded-[24px] border border-border bg-surface p-4 ${className}`}>{children}</View>;
}

export function PrimaryButton({ title, icon, onPress, variant = "primary", style }: { title: string; icon?: keyof typeof MaterialIcons.glyphMap; onPress: () => void; variant?: "primary" | "soft" | "outline"; style?: ViewStyle }) {
  const colors = useColors();
  const backgroundColor = variant === "primary" ? colors.primary : variant === "soft" ? colors.primarySoft : "transparent";
  const color = variant === "primary" ? "#FFFFFF" : colors.primary;
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.primaryButton, { backgroundColor, borderColor: colors.primary, borderWidth: variant === "outline" ? 1 : 0 }, style, pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] }]}>
    {icon ? <MaterialIcons name={icon} size={19} color={color} /> : null}
    <Text style={{ color }} className="font-bold">{title}</Text>
  </Pressable>;
}

export function IconButton({ icon, onPress, label, color }: { icon: keyof typeof MaterialIcons.glyphMap; onPress: () => void; label?: string; color?: string }) {
  const colors = useColors();
  return <Pressable accessibilityLabel={label ?? icon} onPress={onPress} style={({ pressed }) => [styles.iconButton, pressed && { opacity: 0.65 }]}>
    <MaterialIcons name={icon} size={24} color={color ?? colors.foreground} />
  </Pressable>;
}

export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  const colors = useColors();
  return <View className="mb-3 flex-row items-center justify-between"><Text className="text-lg font-bold text-foreground">{title}</Text>{action && onPress ? <Pressable onPress={onPress}><Text style={{ color: colors.primary }} className="font-bold">{action}</Text></Pressable> : null}</View>;
}

export function StatusPill({ label, tone = "success" }: { label: string; tone?: "success" | "warning" | "muted" }) {
  const colors = useColors();
  const backgroundColor = tone === "success" ? colors.successSoft : tone === "warning" ? colors.warningSoft : colors.surfaceAlt;
  const color = tone === "success" ? colors.success : tone === "warning" ? colors.warning : colors.muted;
  return <View style={{ backgroundColor }} className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"><View style={{ backgroundColor: color }} className="h-1.5 w-1.5 rounded-full" /><Text style={{ color }} className="text-[11px] font-extrabold tracking-wide">{label}</Text></View>;
}

export function ScreenHeader({ title, subtitle, back = true, right }: { title: string; subtitle?: string; back?: boolean; right?: React.ReactNode }) {
  return <View className="mb-5 flex-row items-center justify-between"><View className="flex-1 flex-row items-center gap-2">{back ? <IconButton icon="arrow-back" onPress={() => router.back()} /> : null}<View className="flex-1"><Text className="text-2xl font-black text-foreground">{title}</Text>{subtitle ? <Text className="mt-0.5 text-sm text-muted">{subtitle}</Text> : null}</View></View>{right}</View>;
}

export function EmptyState({ icon = "search-off", title, message }: { icon?: keyof typeof MaterialIcons.glyphMap; title: string; message: string }) {
  const colors = useColors();
  return <View className="items-center rounded-[24px] border border-dashed border-border bg-surface p-8"><MaterialIcons name={icon} size={34} color={colors.muted} /><Text className="mt-3 text-base font-bold text-foreground">{title}</Text><Text className="mt-1 text-center text-sm leading-5 text-muted">{message}</Text></View>;
}

const styles = StyleSheet.create({
  primaryButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 20,
  },
  iconButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    padding: 8,
  },
});
