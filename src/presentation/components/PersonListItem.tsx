import { Pressable, StyleSheet, Text, View } from 'react-native';

import { PersonSummary } from '../../domain/models/entities';
import { colors } from '../theme/colors';

type PersonListItemProps = {
  summary: PersonSummary;
  onPress: (personId: string) => void;
};

const formatCurrency = (value: number): string => `$${Math.abs(value).toFixed(2)}`;

export const PersonListItem = ({ summary, onPress }: PersonListItemProps) => {
  const netPositive = summary.netBalance >= 0;
  const initials = summary.person.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Pressable style={styles.container} onPress={() => onPress(summary.person.id)}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      
      <View style={styles.info}>
        <Text style={styles.name}>{summary.person.name}</Text>
        <Text style={styles.meta}>{summary.transactionCount} total records</Text>
      </View>

      <View style={styles.balanceInfo}>
        <Text style={[styles.balance, { color: netPositive ? colors.positive : colors.negative }]}>
          {netPositive ? '+' : '-'}{formatCurrency(summary.netBalance)}
        </Text>
        <Text style={styles.activeCount}>{summary.activeTransactionCount} active</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 16,
    fontWeight: '800',
  },
  activeCount: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
});

