import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useLedger } from './src/application/hooks/useLedger';
import { DashboardScreen } from './src/presentation/screens/DashboardScreen';
import { InsightsScreen } from './src/presentation/screens/InsightsScreen';
import { PeopleScreen } from './src/presentation/screens/PeopleScreen';
import { TransactionsScreen } from './src/presentation/screens/TransactionsScreen';
import { colors } from './src/presentation/theme/colors';

type TabKey = 'dashboard' | 'transactions' | 'people' | 'insights';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'people', label: 'People' },
  { key: 'insights', label: 'Insights' },
];

export default function App() {
  const ledger = useLedger();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.appBar}>
        <Text style={styles.title}>OweMe</Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tabButton, activeTab === tab.key ? styles.tabActive : null]}
          >
            <Text style={[styles.tabText, activeTab === tab.key ? styles.tabTextActive : null]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {ledger.loading ? <Text style={styles.metaText}>Loading ledger...</Text> : null}
        {ledger.error ? <Text style={styles.errorText}>{ledger.error}</Text> : null}
        {!ledger.loading ? renderContent(activeTab, ledger) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const renderContent = (tab: TabKey, ledger: ReturnType<typeof useLedger>) => {
  switch (tab) {
    case 'dashboard':
      return <DashboardScreen ledger={ledger} />;
    case 'transactions':
      return <TransactionsScreen ledger={ledger} />;
    case 'people':
      return <PeopleScreen ledger={ledger} />;
    case 'insights':
      return <InsightsScreen ledger={ledger} />;
    default:
      return null;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  appBar: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  tabButton: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  tabActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  tabText: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#0D131D',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 30,
    gap: 10,
  },
  metaText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  errorText: {
    color: colors.negative,
    fontSize: 14,
  },
});
