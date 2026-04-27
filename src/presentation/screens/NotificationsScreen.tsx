import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import { colors } from '../theme/colors';

type NotificationsScreenProps = {
  onBack: () => void;
};

export const NotificationsScreen = ({ onBack }: NotificationsScreenProps) => {
  const notifications = [
    { id: '1', title: 'Notifications', message: 'coming soon', time: '', icon: 'clock', color: colors.warning },
    
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={[styles.clearBtn, { opacity: 0.5 }]}>
          <Text style={styles.clearText}>Clear All <Text style={styles.comingSoon}>Coming Next Version</Text></Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Feather name="bell-off" size={48} color={colors.border} />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        ) : (
          notifications.map((notif) => (
            <View key={notif.id} style={styles.notifRow}>
              <View style={[styles.iconBox, { backgroundColor: notif.color + '15' }]}>
                <Feather name={notif.icon as any} size={20} color={notif.color} />
              </View>
              <View style={styles.info}>
                <View style={styles.row}>
                  <Text style={styles.notifTitle}>{notif.title}</Text>
                  <Text style={styles.notifTime}>{notif.time}</Text>
                </View>
                <Text style={styles.notifMessage}>{notif.message}</Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '900',
  },
  clearBtn: {
    paddingHorizontal: 12,
  },
  clearText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 60,
  },
  notifRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notifTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  notifTime: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  notifMessage: {
    color: colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  empty: {
    paddingTop: 100,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoon: {
    color: colors.warning,
    fontSize: 11,
    fontWeight: '800',
  },
});
