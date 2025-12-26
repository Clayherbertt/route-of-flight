import { useState } from 'react';
import { StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert, View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp } = useAuth();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signin');
  const [loading, setLoading] = useState(false);
  
  const [signInForm, setSignInForm] = useState({ email: '', password: '' });
  const [signUpForm, setSignUpForm] = useState({ 
    firstName: '',
    lastName: '',
    email: '', 
    password: '', 
    confirmPassword: '' 
  });

  const handleSignIn = async () => {
    if (!signInForm.email || !signInForm.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(signInForm.email, signInForm.password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Sign In Failed', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!signUpForm.email || !signUpForm.password || !signUpForm.confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (signUpForm.password !== signUpForm.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (signUpForm.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await signUp(
        signUpForm.email, 
        signUpForm.password, 
        signUpForm.firstName || undefined, 
        signUpForm.lastName || undefined
      );
      Alert.alert(
        'Success', 
        'Account created! Please check your email to verify your account.',
        [{ text: 'OK', onPress: () => setActiveTab('signin') }]
      );
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#C8CCD2', '#24587E', '#17293F']}
      locations={[0, 0.5, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/rof-logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>

          {/* Form Card Container */}
          <View style={styles.formCard}>
          {/* Tab Selector */}
          <View style={[styles.tabContainer, isDark && styles.tabContainerDark]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signin' && styles.activeTab]}
              onPress={() => setActiveTab('signin')}
            >
              <ThemedText 
                type={activeTab === 'signin' ? 'defaultSemiBold' : 'default'}
                lightColor={activeTab === 'signin' ? '#fff' : undefined}
                darkColor={activeTab === 'signin' ? '#fff' : undefined}
              >
                Sign In
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'signup' && styles.activeTab]}
              onPress={() => setActiveTab('signup')}
            >
              <ThemedText 
                type={activeTab === 'signup' ? 'defaultSemiBold' : 'default'}
                lightColor={activeTab === 'signup' ? '#fff' : undefined}
                darkColor={activeTab === 'signup' ? '#fff' : undefined}
              >
                Sign Up
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Sign In Form */}
          {activeTab === 'signin' && (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={signInForm.email}
                  onChangeText={(text) => setSignInForm({ ...signInForm, email: text })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor="#999"
                  value={signInForm.password}
                  onChangeText={(text) => setSignInForm({ ...signInForm, password: text })}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignIn}
                disabled={loading}
              >
                <ThemedText style={styles.buttonText}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {/* Sign Up Form */}
          {activeTab === 'signup' && (
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>First Name (Optional)</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor="#999"
                  value={signUpForm.firstName}
                  onChangeText={(text) => setSignUpForm({ ...signUpForm, firstName: text })}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Last Name (Optional)</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your last name"
                  placeholderTextColor="#999"
                  value={signUpForm.lastName}
                  onChangeText={(text) => setSignUpForm({ ...signUpForm, lastName: text })}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  value={signUpForm.email}
                  onChangeText={(text) => setSignUpForm({ ...signUpForm, email: text })}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password (min. 6 characters)"
                  placeholderTextColor="#999"
                  value={signUpForm.password}
                  onChangeText={(text) => setSignUpForm({ ...signUpForm, password: text })}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <ThemedText style={styles.label}>Confirm Password</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  placeholderTextColor="#999"
                  value={signUpForm.confirmPassword}
                  onChangeText={(text) => setSignUpForm({ ...signUpForm, confirmPassword: text })}
                  secureTextEntry
                  autoCapitalize="none"
                  autoComplete="password-new"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSignUp}
                disabled={loading}
              >
                <ThemedText style={styles.buttonText}>
                  {loading ? 'Creating Account...' : 'Sign Up'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    alignItems: 'center',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginTop: 0,
  },
  logo: {
    width: 240,
    height: 280,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 30,
    borderRadius: 8,
    backgroundColor: '#F3F4F6', // gray-100 equivalent
    padding: 4,
  },
  tabContainerDark: {
    backgroundColor: '#374151', // gray-700 equivalent
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: '#24587E', // brand-medium color
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB', // gray-200 equivalent
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827', // gray-900 equivalent
  },
  inputDark: {
    borderColor: '#374151', // gray-700 equivalent
    backgroundColor: '#1F2937', // gray-800 equivalent
    color: '#F9FAFB', // gray-50 equivalent
  },
  button: {
    backgroundColor: '#24587E', // brand-medium color
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

