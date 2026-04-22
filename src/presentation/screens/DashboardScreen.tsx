import { StyleSheet, Text, View } from 'react-native';

import { LedgerViewModel } from '../../application/hooks/useLedger';
import { StatCard } from '../components/StatCard';
import { colors } from '../theme/colors';

type DashboardScreenProps = {
  ledger: LedgerViewModel;
};

const formatCurrency = (value: number): string => `$${Math.abs(value).toFixed(2)}`;

export const DashboardScreen = ({ ledger }: DashboardScreenProps) => {
  const { totalLent, totalBorrowed, netBalance } = ledger.dashboard;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Dashboard</Text>
      <Text style={styles.subtitle}>Track your person-to-person debts with clarity.</Text>

      <View style={styles.grid}>
        <StatCard label="Total Lent" value={`$${totalLent.toFixed(2)}`} valueColor={colors.positive} />
        <StatCard
          label="Total Borrowed"
          value={`$${totalBorrowed.toFixed(2)}`}
          valueColor={colors.negative}
        />
      </View>

      <StatCard
        label="Net Balance"
        value={`${netBalance >= 0 ? '+' : '-'}${formatCurrency(netBalance)}`}
        valueColor={netBalance >= 0 ? colors.positive : colors.negative}
      />

      <View style={styles.hintRow}>
        <Text style={styles.hintLabel}>Status:</Text>
        <Text style={[styles.hintValue, { color: netBalance >= 0 ? colors.positive : colors.negative }]}>
          {netBalance >= 0 ? 'You are net positive' : 'You owe more overall'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    gap: 10,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderColor: colors.border,
    borderWidth: 1,
  },
  hintLabel: {
    color: colors.textSecondary,
    fontWeight: '600',
    fontSize: 13,
  },
  hintValue: {
    fontWeight: '700',
    fontSize: 13,
  },
});
