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

  return (
    <Pressable style={styles.container} onPress={() => onPress(summary.person.id)}>
      <View>
        <Text style={styles.name}>{summary.person.name}</Text>
        <Text style={styles.meta}>{summary.transactionCount} transactions</Text>
      </View>

      <Text style={[styles.balance, { color: netPositive ? colors.positive : colors.negative }]}>
        {netPositive ? '+' : '-'}{formatCurrency(summary.netBalance)}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 12,
    borderColor: colors.border,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  name: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  meta: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 4,
  },
  balance: {
    fontSize: 15,
    fontWeight: '700',
  },
});
