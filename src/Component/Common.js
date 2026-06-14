import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { Icon } from "react-native-elements";

/**
 * Customized Text component with standard font family, default color, and typography variations.
 */
export const AppText = ({
  style,
  children,
  bold,
  medium,
  color,
  size,
  align,
  ...props
}) => {
  const textStyles = [
    styles.defaultText,
    medium && styles.medium,
    bold && styles.bold,
    color && { color },
    size && { fontSize: size },
    align && { textAlign: align },
    style,
  ];

  return (
    <Text style={textStyles} {...props}>
      {children}
    </Text>
  );
};

/**
 * Glassmorphic container Card component with unified padding, border, and shadows.
 */
export const GlassCard = ({ style, children, ...props }) => {
  return (
    <View style={[styles.glassCard, style]} {...props}>
      {children}
    </View>
  );
};

/**
 * Standardized icon button matching the application's interactive controls design.
 */
export const AppIconButton = ({
  name,
  type = "ionicon",
  size = 24,
  color = "#1E293B",
  onPress,
  style,
  disabled,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[styles.iconButton, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      <Icon name={name} type={type} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  defaultText: {
    fontFamily: "Arial",
    color: "#1E293B",
    fontSize: 14,
  },
  medium: {
    fontWeight: "500",
  },
  bold: {
    fontWeight: "bold",
  },
  glassCard: {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.5)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderRadius: 20,
  },
});
