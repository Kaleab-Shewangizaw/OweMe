import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { useLedger } from './src/application/hooks/useLedger';
import { DashboardScreen } from './src/presentation/screens/DashboardScreen';
import { InsightsScreen } from './src/presentation/screens/InsightsScreen';
import { PeopleScreen } from './src/presentation/screens/PeopleScreen';
import { TransactionsScreen } from './src/presentation/screens/TransactionsScreen';
import { colors } from './src/presentation/theme/colors';

type TabKey = 'dashboard' | 'transactions' | 'people' | 'insights';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Home', icon: 'grid' },
  { key: 'transactions', label: 'History', icon: 'list' },
  { key: 'people', label: 'Contacts', icon: 'users' },
  { key: 'insights', label: 'Trends', icon: 'pie-chart' },
];

export default function App() {
  const ledger = useLedger();
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Good morning,</Text>
          <Text style={styles.appName}>OweMe</Text>
        </View>
        <Pressable style={styles.profileBtn}>
          <Feather name="bell" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.content}>
        {ledger.loading ? (
          <View style={styles.center}>
            <Text style={styles.metaText}>Syncing Ledger...</Text>
          </View>
        ) : null}
        
        {ledger.error ? (
          <View style={styles.center}>
             <Text style={styles.errorText}>{ledger.error}</Text>
          </View>
        ) : null}

        {!ledger.loading && !ledger.error ? (
          <View style={{ flex: 1 }}>{renderContent(activeTab, ledger)}</View>
        ) : null}
      </View>

      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={styles.tabItem}
            >
              <View style={[styles.tabIconContainer, isActive ? styles.tabIconActive : null]}>
                <Feather 
                  name={tab.icon as any} 
                  size={20} 
                  color={isActive ? colors.primary : colors.textMuted} 
                />
              </View>
              <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : null]}>
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const renderContent = (tab: TabKey, ledger: ReturnType<typeof useLedger>) => {
  switch (tab) {
    case 'dashboard': return <DashboardScreen ledger={ledger} />;
    case 'transactions': return <TransactionsScreen ledger={ledger} />;
    case 'people': return <PeopleScreen ledger={ledger} />;
    case 'insights': return <InsightsScreen ledger={ledger} />;
    default: return null;
  }
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
  appName: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 0,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  tabIconContainer: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  tabIconActive: {
    backgroundColor: colors.primary + '15',
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  tabLabelActive: {
    color: colors.primary,
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

