import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export function DashboardMenu() {
  const { user, signOut } = useAuth();
  const { isAdmin } = useIsAdmin();
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/auth');
      setMenuVisible(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign out');
    }
  };

  const menuItems = [
    { id: 'profile', label: 'Profile', onPress: () => { setMenuVisible(false); router.push('/profile'); } },
    ...(isAdmin ? [{ id: 'admin', label: 'Admin Dashboard', onPress: () => { setMenuVisible(false); router.push('/admin'); } }] : []),
    { id: 'logbook', label: 'Logbook', onPress: () => { setMenuVisible(false); router.push('/logbook'); } },
    { id: 'route', label: 'Route Builder', onPress: () => { setMenuVisible(false); router.push('/route'); } },
    { id: 'airlines', label: 'Airlines', onPress: () => { setMenuVisible(false); router.push('/airlines'); } },
    { id: 'resume', label: 'Resume Builder', onPress: () => { setMenuVisible(false); router.push('/resume'); } },
  ];

  return (
    <>
      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => setMenuVisible(true)}
      >
        <Ionicons name="menu" size={24} color="#24587E" />
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setMenuVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <View>
                <ThemedText style={styles.userName}>
                  {user?.user_metadata?.full_name || user?.user_metadata?.display_name || 'Pilot'}
                </ThemedText>
                <ThemedText style={styles.userEmail}>
                  {user?.email}
                </ThemedText>
              </View>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuItems}>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <ThemedText style={styles.menuItemText}>{item.label}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '80%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
  },
  menuItems: {
    paddingVertical: 10,
  },
  menuItem: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuItemText: {
    fontSize: 16,
    color: '#111827',
  },
  signOutButton: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

