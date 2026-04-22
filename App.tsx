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

type TabKey = 'dashboard' | 'people' | 'transaction_new' | 'transactions_history' | 'insights';

const tabs: { key: TabKey; label: string; icon: string }[] = [
  { key: 'dashboard', label: 'Home', icon: 'home' },
  { key: 'people', label: 'Contacts', icon: 'users' },
  { key: 'transaction_new', label: 'New', icon: 'plus-circle' },
  { key: 'transactions_history', label: 'History', icon: 'clock' },
  { key: 'insights', label: 'Trends', icon: 'trending-up' },
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
                  size={22} 
                  color={isActive ? colors.background : colors.textMuted} 
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
    case 'dashboard':
      return <DashboardScreen ledger={ledger} />;
    case 'people':
      return <PeopleScreen ledger={ledger} />;
    case 'transaction_new':
      return <TransactionsScreen key="new" ledger={ledger} initialMode="add" />;
    case 'transactions_history':
      return <TransactionsScreen key="history" ledger={ledger} initialMode="history" />;
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
    backgroundColor: colors.surface,
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    height: 72,
    borderRadius: 36,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabIconContainer: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  tabIconActive: {
    backgroundColor: colors.primary,
  },
  tabLabel: {
    display: 'none', // Hide labels for a cleaner minimal look, icon-only focus
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

