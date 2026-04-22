import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import { LedgerViewModel } from '../../application/hooks/useLedger';
import { SectionCard } from '../components/SectionCard';
import { StatCard } from '../components/StatCard';
import { colors } from '../theme/colors';

type DashboardScreenProps = {
  ledger: LedgerViewModel;
};

const screenWidth = Dimensions.get('window').width;

const formatCurrency = (value: number): string => `$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

export const DashboardScreen = ({ ledger }: DashboardScreenProps) => {
  const { totalLent, totalBorrowed, netBalance, historicalBalance } = ledger.dashboard;

  const chartData = {
    labels: historicalBalance.slice(-6).map(b => b.date.split('-')[2]), // Last 6 days
    datasets: [{
      data: historicalBalance.length > 0 ? historicalBalance.slice(-6).map(b => b.balance) : [0],
      color: (opacity = 1) => colors.primary,
      strokeWidth: 3
    }]
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Net Balance</Text>
        <Text style={[styles.balanceValue, { color: netBalance >= 0 ? colors.positive : colors.negative }]}>
          {netBalance >= 0 ? '+' : '-'}{formatCurrency(netBalance)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: netBalance >= 0 ? colors.positive + '20' : colors.negative + '20' }]}>
          <Text style={[styles.statusText, { color: netBalance >= 0 ? colors.positive : colors.negative }]}>
            {netBalance >= 0 ? 'Surplus' : 'Deficit'}
          </Text>
        </View>
      </View>

      <View style={styles.grid}>
        <StatCard 
          label="Total Lent" 
          value={formatCurrency(totalLent)} 
          valueColor={colors.positive} 
          icon="arrow-up-right"
        />
        <StatCard
          label="Borrowed"
          value={formatCurrency(totalBorrowed)}
          valueColor={colors.negative}
          icon="arrow-down-left"
        />
      </View>

      {historicalBalance.length > 1 && (
        <SectionCard title="Balance Trend" subtitle="Your financial activity over time">
          <LineChart
            data={chartData}
            width={screenWidth - 80}
            height={180}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.surface,
              decimalPlaces: 0,
              color: (opacity = 1) => colors.primary,
              labelColor: (opacity = 1) => colors.textSecondary,
              style: { borderRadius: 16 },
              propsForDots: {
                r: "4",
                strokeWidth: "2",
                stroke: colors.primary
              }
            }}
            bezier
            style={styles.chart}
          />
        </SectionCard>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Active People</Text>
          <Text style={styles.infoValue}>{ledger.personSummaries.filter(p => p.activeTransactionCount > 0).length}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Outstanding Loans</Text>
          <Text style={styles.infoValue}>{ledger.data.transactions.filter(t => t.status === 'active').length}</Text>
        </View>
      </View>
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
    paddingBottom: 40,
    gap: 24,
    paddingTop: 10,
  },
  balanceCard: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  statusBadge: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  grid: {
    flexDirection: 'row',
    gap: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
    marginLeft: -10,
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 16,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  infoValue: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
});


