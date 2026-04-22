import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { LedgerViewModel } from '../../application/hooks/useLedger';
import { SectionCard } from '../components/SectionCard';
import { colors } from '../theme/colors';

type InsightsScreenProps = {
  ledger: LedgerViewModel;
};

export const InsightsScreen = ({ ledger }: InsightsScreenProps) => {
  const { frequentBorrowers, upcomingDueTransactions, overdueTransactions } = ledger.insights;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <SectionCard
        title="Frequent borrowers"
        subtitle="People with repeated borrowing patterns"
      >
        {frequentBorrowers.length === 0 ? (
          <Text style={styles.empty}>No frequent borrowers detected yet.</Text>
        ) : (
          <View style={styles.list}>
            {frequentBorrowers.map((item) => (
              <Text key={item.person.id} style={styles.row}>
                {item.person.name} - {item.transactionCount} transactions
              </Text>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard title="Upcoming due dates" subtitle="Due within the next 7 days">
        {upcomingDueTransactions.length === 0 ? (
          <Text style={styles.empty}>No upcoming due dates.</Text>
        ) : (
          <View style={styles.list}>
            {upcomingDueTransactions.map((transaction) => (
              <Text key={transaction.id} style={styles.row}>
                {ledger.getPersonById(transaction.personId)?.name ?? 'Unknown'} - ${transaction.amount.toFixed(2)} due {transaction.dueDate}
              </Text>
            ))}
          </View>
        )}
      </SectionCard>

      <SectionCard title="Overdue debts" subtitle="Active items past their due date">
        {overdueTransactions.length === 0 ? (
          <Text style={styles.empty}>No overdue items.</Text>
        ) : (
          <View style={styles.list}>
            {overdueTransactions.map((transaction) => (
              <Text key={transaction.id} style={[styles.row, styles.overdue]}>
                {ledger.getPersonById(transaction.personId)?.name ?? 'Unknown'} - ${transaction.amount.toFixed(2)} overdue since {transaction.dueDate}
              </Text>
            ))}
          </View>
        )}
      </SectionCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 40,
    gap: 12,
  },
  list: {
    gap: 8,
  },
  row: {
    color: colors.textPrimary,
    fontSize: 13,
  },
  overdue: {
    color: colors.negative,
  },
  empty: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
