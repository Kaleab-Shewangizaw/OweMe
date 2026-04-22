import { Feather } from '@expo/vector-icons';
import { StyleSheet, Text, View, Pressable, ScrollView, Image } from 'react-native';
import { colors } from '../theme/colors';

type ProfileScreenProps = {
  onBack: () => void;
};

export const ProfileScreen = ({ onBack }: ProfileScreenProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Account Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHero}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Feather name="user" size={48} color={colors.primary} />
            </View>
            <Pressable style={styles.editAvatarBtn}>
              <Feather name="camera" size={16} color="#FFF" />
            </Pressable>
          </View>
          <Text style={styles.userName}>Kaleab Shewangizaw</Text>
          <Text style={styles.userEmail}>kaleab.s@example.com</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Security</Text>
          <View style={styles.options}>
            <MenuOption icon="lock" label="Change PIN" sublabel="Update your 4-digit security code" />
            <MenuOption icon="shield" label="Biometric Access" sublabel="Enable FaceID or Fingerprint" hasSwitch />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Preferences</Text>
          <View style={styles.options}>
            <MenuOption icon="moon" label="Dark Theme" sublabel="Optimized for late night tracking" hasSwitch active />
            <MenuOption icon="bell" label="Reminders" sublabel="Get notified about upcoming dues" hasSwitch active />
            <MenuOption icon="database" label="Backup Data" sublabel="Sync your data to the cloud" />
          </View>
        </View>

        <Pressable style={styles.logoutBtn}>
          <Feather name="log-out" size={18} color={colors.negative} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const MenuOption = ({ icon, label, sublabel, hasSwitch, active }: any) => (
  <Pressable style={styles.optionRow}>
    <View style={[styles.optionIcon, { backgroundColor: colors.surface }]}>
      <Feather name={icon} size={18} color={colors.primary} />
    </View>
    <View style={styles.optionInfo}>
      <Text style={styles.optionLabel}>{label}</Text>
      <Text style={styles.optionSublabel}>{sublabel}</Text>
    </View>
    {hasSwitch ? (
      <View style={[styles.switch, active && styles.switchActive]}>
        <View style={[styles.switchThumb, active && styles.switchThumbActive]} />
      </View>
    ) : (
      <Feather name="chevron-right" size={18} color={colors.textMuted} />
    )}
  </Pressable>
);

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
  content: {
    paddingBottom: 60,
  },
  profileHero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  userName: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '900',
  },
  userEmail: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  options: {
    gap: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionInfo: {
    flex: 1,
  },
  optionLabel: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  optionSublabel: {
    color: colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  switch: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surface,
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: colors.primary + '30',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textMuted,
  },
  switchThumbActive: {
    backgroundColor: colors.primary,
    alignSelf: 'flex-end',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 20,
    paddingVertical: 16,
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.negative + '30',
  },
  logoutText: {
    color: colors.negative,
    fontSize: 16,
    fontWeight: '800',
  },
});
