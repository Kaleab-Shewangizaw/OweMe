import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

import { useLedger } from './src/application/hooks/useLedger';
import { DashboardScreen } from './src/presentation/screens/DashboardScreen';
import { InsightsScreen } from './src/presentation/screens/InsightsScreen';
import { LockScreen } from './src/presentation/screens/LockScreen';
import { NotificationsScreen } from './src/presentation/screens/NotificationsScreen';
import { PeopleScreen } from './src/presentation/screens/PeopleScreen';
import { ProfileScreen } from './src/presentation/screens/ProfileScreen';
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
  const [authenticated, setAuthenticated] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [usePinFallback, setUsePinFallback] = useState(false);

  useEffect(() => {
    const attemptBiometricAuth = async () => {
      if (ledger.preferences.biometricsEnabled && ledger.preferences.isSetupComplete && !authenticated && !usePinFallback) {
        try {
          const hasHardware = await LocalAuthentication.hasHardwareAsync();
          if (hasHardware) {
            const isEnrolled = await LocalAuthentication.isEnrolledAsync();
            if (isEnrolled) {
              const result = await LocalAuthentication.authenticateAsync({
                promptMessage: 'Authenticate to access OweMe',
              });
              if (result.success) {
                setAuthenticated(true);
              } else {
                setUsePinFallback(true);
              }
            } else {
              setUsePinFallback(true);
            }
          } else {
            setUsePinFallback(true);
          }
        } catch (error) {
          setUsePinFallback(true);
        }
      }
    };

    if (!ledger.loading) {
      attemptBiometricAuth();
    }
  }, [ledger.preferences.biometricsEnabled, ledger.preferences.isSetupComplete, authenticated, usePinFallback, ledger.loading]);

  // Authentication Flow
  if (!authenticated && !ledger.loading) {
    const mode = ledger.preferences.isSetupComplete ? 'unlock' : 'setup';
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <LockScreen
          mode={mode}
          storedPin={ledger.preferences.pin}
          onSuccess={(pin) => {
            if (mode === 'setup') {
              ledger.updatePreferences({ pin, isSetupComplete: true });
            }
            setAuthenticated(true);
            setUsePinFallback(false);
          }}
        />
      </SafeAreaView>
    );
  }

  const handleDashboardAction = (action: 'Lend' | 'Borrow' | 'Split' | 'Settle') => {
    switch (action) {
      case 'Lend':
      case 'Borrow':
      case 'Split':
        setActiveTab('transaction_new');
        break;
      case 'Settle':
        setActiveTab('transactions_history');
        break;
    }
  };

  if (showProfile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ProfileScreen onBack={() => setShowProfile(false)} ledger={ledger} />
      </SafeAreaView>
    );
  }

  if (showNotifications) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <NotificationsScreen onBack={() => setShowNotifications(false)} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoCircle}>
            <Feather name="layers" size={18} color={colors.primary} />
          </View>
          <Text style={styles.appName}>OweMe</Text>
        </View>
        <View style={styles.headerActions}>

          <Pressable style={styles.headerBtn} onPress={() => setShowNotifications(true)}>
            <Feather name="bell" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable style={[styles.headerBtn, styles.userBtn]} onPress={() => setShowProfile(true)}>
            <Feather name="user" size={20} color={colors.textPrimary} />
            <View style={styles.onlineBadge} />
          </Pressable>
        </View>
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
          <View style={{ flex: 1 }}>{renderContent(activeTab, ledger, handleDashboardAction)}</View>
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

const renderContent = (tab: TabKey, ledger: any, onAction: any) => {
  switch (tab) {
    case 'dashboard':
      return <DashboardScreen ledger={ledger} onAction={onAction} />;
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
    paddingTop: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  appName: {

    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -1,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBtn: {
    borderColor: colors.primary + '20',
  },
  onlineBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.positive,
    borderWidth: 2,
    borderColor: colors.surface,
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
    borderRadius: 999,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
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

