import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

type StatCardProps = {
  label: string;
  value: string;
  valueColor?: string;
};

export const StatCard = ({ label, value, valueColor }: StatCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  label: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  value: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
  },
});
