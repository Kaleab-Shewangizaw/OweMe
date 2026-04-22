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
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  avatarText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900',
  },
  info: {
    flex: 1,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  meta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  balanceInfo: {
    alignItems: 'flex-end',
  },
  balance: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  activeCount: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 4,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
});


