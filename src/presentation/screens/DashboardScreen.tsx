import { Dimensions, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';

import { LedgerViewModel } from '../../application/hooks/useLedger';
import { colors } from '../theme/colors';

type DashboardScreenProps = {
  ledger: LedgerViewModel;
  onAction: (action: 'Lend' | 'Borrow' | 'Split' | 'Settle') => void;
};


const screenWidth = Dimensions.get('window').width;

const formatCurrency = (value: number): string => `$${Math.abs(value).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

export const DashboardScreen = ({ ledger, onAction }: DashboardScreenProps) => {

  const { totalLent, totalBorrowed, netBalance, historicalBalance } = ledger.dashboard;

  // Ensure we always have at least 2 points for the chart kit to render correctly
  const chartPoints = historicalBalance.length > 1 
    ? historicalBalance.slice(-6) 
    : [
        { date: 'Start', balance: 0 },
        ...(historicalBalance.length > 0 ? historicalBalance : [{ date: 'Today', balance: 0 }])
      ];

  const chartData = {
    labels: chartPoints.map(b => b.date.includes('-') ? b.date.split('-')[2] : b.date),
    datasets: [{
      data: chartPoints.map(b => b.balance),
      color: (opacity = 1) => colors.primary,
      strokeWidth: 4
    }]
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Hero Balance Section */}
      {/* ... Hero Content ... */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <Text style={styles.heroLabel}>Your Net Worth</Text>
          <Text style={[styles.heroValue, { color: netBalance >= 0 ? colors.positive : colors.negative }]}>
            {netBalance >= 0 ? '+' : '-'}{formatCurrency(netBalance)}
          </Text>
          <View style={[styles.heroBadge, { backgroundColor: netBalance >= 0 ? colors.positive + '30' : colors.negative + '30' }]}>
            <Feather 
              name={netBalance >= 0 ? "trending-up" : "trending-down"} 
              size={12} 
              color={netBalance >= 0 ? colors.positive : colors.negative} 
            />
            <Text style={[styles.heroBadgeText, { color: netBalance >= 0 ? colors.positive : colors.negative }]}>
              {netBalance >= 0 ? 'Surplus' : 'Deficit'}
            </Text>
          </View>
        </View>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.positive + '10', borderColor: colors.positive + '20' }]}>
          <Feather name="arrow-up-right" size={20} color={colors.positive} />
          <View>
            <Text style={styles.statLabel}>Lent</Text>
            <Text style={[styles.statValue, { color: colors.positive }]}>{formatCurrency(totalLent)}</Text>
          </View>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.negative + '10', borderColor: colors.negative + '20' }]}>
          <Feather name="arrow-down-left" size={20} color={colors.negative} />
          <View>
            <Text style={styles.statLabel}>Borrowed</Text>
            <Text style={[styles.statValue, { color: colors.negative }]}>{formatCurrency(totalBorrowed)}</Text>
          </View>
        </View>
      </View>

      {/* Interactive Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
  {[
    { icon: 'plus', label: 'Lend', color: colors.primary },
    { icon: 'minus', label: 'Borrow', color: colors.accent },
    { icon: 'users', label: 'Split', color: colors.catShop },
    { icon: 'repeat', label: 'Settle', color: colors.positive },
  ].map((action, i) => {
    const isDisabled = action.label === 'Split';

    return (
      <Pressable
        key={i}
        style={[
          styles.actionItem,
          isDisabled && { opacity: 0.4 } // optional visual feedback
        ]}
        disabled={isDisabled}
        onPress={() => {
          if (!isDisabled) {
            onAction(action.label as any);
          }
        }}
      >
        <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
          <Feather name={action.icon as any} size={22} color={action.color} />
        </View>
        <Text style={styles.actionLabel}>{action.label}</Text>
      </Pressable>
    );
  })}
</View>
      </View>

      {/* Immersive Chart Section */}
      <View style={styles.chartSection}>
        <Text style={styles.sectionHeader}>Activity Trend</Text>
        <LineChart
          data={chartData}
          width={screenWidth - 40}
          height={200}
          chartConfig={{
            backgroundColor: colors.background,
            backgroundGradientFrom: colors.background,
            backgroundGradientTo: colors.background,
            decimalPlaces: 0,
            color: (opacity = 1) => colors.primary,
            labelColor: (opacity = 1) => colors.textMuted,
            strokeWidth: 2,
            propsForDots: {
              r: "6",
              strokeWidth: "3",
              stroke: colors.background
            },
            propsForBackgroundLines: {
              stroke: colors.border,
              strokeDasharray: '4',
            }
          }}
          bezier
          withVerticalLines={false}
          withHorizontalLines={true}
          style={styles.chart}
        />
      </View>

      {/* Fun Glance Section */}
      <View style={[styles.infoSection, { backgroundColor: colors.surface }]}>
        <Text style={styles.sectionHeader}>On your radar</Text>
        <View style={styles.radarRow}>
          <View style={styles.radarItem}>
            <Text style={styles.radarValue}>{ledger.personSummaries.filter(p => p.activeTransactionCount > 0).length}</Text>
            <Text style={styles.radarLabel}>Active Contacts</Text>
          </View>
          <View style={styles.verticalDivider} />
          <View style={styles.radarItem}>
            <Text style={styles.radarValue}>{ledger.data.transactions.filter(t => t.status === 'active').length}</Text>
            <Text style={styles.radarLabel}>Unsettled</Text>
          </View>
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
    paddingBottom: 120,
  },

  hero: {
    paddingTop: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  heroContent: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: colors.surface,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroLabel: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  heroValue: {
    fontSize: 54,
    fontWeight: '900',
    letterSpacing: -2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 32,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    gap: 12,
  },
  statLabel: {
    color: colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionHeader: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionItem: {
    alignItems: 'center',
    gap: 10,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  chartSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    alignItems: 'center',
  },
  chart: {
    marginTop: 10,
  },
  infoSection: {
    marginHorizontal: 20,
    padding: 28,
    borderRadius: 36,
    borderWidth: 1,
    borderColor: colors.border,
  },
  radarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  radarItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  radarValue: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '900',
  },
  radarLabel: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  verticalDivider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
});



