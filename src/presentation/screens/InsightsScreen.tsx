import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LedgerViewModel } from '../../application/hooks/useLedger';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';

type InsightsScreenProps = {
  ledger: LedgerViewModel;
};

export const InsightsScreen = ({ ledger }: InsightsScreenProps) => {
  const { frequentBorrowers, upcomingDueTransactions, overdueTransactions } = ledger.insights;

  const maxBorrowCount = Math.max(...frequentBorrowers.map(b => b.transactionCount), 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionCard
        title="Top Contacts"
        subtitle="People with the most interactions"
      >
        {frequentBorrowers.length === 0 ? (
          <Text style={styles.empty}>Start adding records to see trends.</Text>
        ) : (
          <View style={styles.chart}>
            {frequentBorrowers.map((item) => (
              <View key={item.person.id} style={styles.barRow}>
                <Text style={styles.barLabel}>{item.person.name}</Text>
                <View style={styles.barContainer}>
                  <View 
                    style={[
                      styles.bar, 
                      { width: `${(item.transactionCount / maxBorrowCount) * 100}%` }
                    ]} 
                  />
                  <Text style={styles.barValue}>{item.transactionCount}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard title="Upcoming Dues" subtitle="Expiring within 7 days">
        {upcomingDueTransactions.length === 0 ? (
          <Text style={styles.empty}>All caught up!</Text>
        ) : (
          <View style={styles.list}>
            {upcomingDueTransactions.map((transaction) => (
              <View key={transaction.id} style={styles.itemRow}>
                <View style={styles.dot} />
                <Text style={styles.rowText}>
                  {ledger.getPersonById(transaction.personId)?.name} - ${transaction.amount.toFixed(2)}
                </Text>
                <Text style={styles.dateText}>{transaction.dueDate}</Text>
              </View>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard title="Overdue" subtitle="Action required immediately">
        {overdueTransactions.length === 0 ? (
          <Text style={styles.empty}>None found. Great job!</Text>
        ) : (
          <View style={styles.list}>
            {overdueTransactions.map((transaction) => (
              <View key={transaction.id} style={[styles.itemRow, styles.overdueRow]}>
                <View style={[styles.dot, { backgroundColor: colors.negative }]} />
                <Text style={[styles.rowText, { color: colors.negative }]}>
                  {ledger.getPersonById(transaction.personId)?.name} - ${transaction.amount.toFixed(2)}
                </Text>
                <Text style={styles.dateText}>Expired</Text>
              </View>
            ))}
          </View>
        )}
      </SectionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    paddingTop: 10,
  },
  chart: {
    gap: 20,
    marginTop: 8,
  },
  barRow: {
    gap: 10,
  },
  barLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  bar: {
    height: 10,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },
  barValue: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
  },
  list: {
    gap: 2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  overdueRow: {
    borderBottomColor: colors.negative + '20',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  rowText: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  dateText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 20,
    fontWeight: '500',
  },
});


