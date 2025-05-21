// src/screens/auth/RegisterScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  Alert,
  StatusBar,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail, validatePassword, passwordsMatch, isNotEmpty } from '../../utils/validation';

const { width, height } = Dimensions.get('window');

// Custom Input Component
const InputField = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry = false, 
  error, 
  icon,
  keyboardType = 'default'
}) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, isFocused && styles.focusedLabel]}>{label}</Text>
      <View style={[
        styles.inputWrapper, 
        isFocused && styles.focusedInput,
        error && styles.errorInput
      ]}>
        <View style={styles.inputIcon}>
          <Text style={styles.iconText}>{icon}</Text>
        </View>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.gray}
          secureTextEntry={secureTextEntry}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          keyboardType={keyboardType}
          autoCapitalize="none"
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

// Role Selection Component
const RoleSelector = ({ selectedRole, onRoleChange }) => {
  const roles = [
    { id: 'USER', label: 'Standard User', description: 'Basic plant monitoring' },
    { id: 'ADMIN', label: 'Administrator', description: 'Full system control' },
    { id: 'GUEST', label: 'Guest / View-only', description: 'Limited access' },
  ];
  
  return (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorLabel}>Select Account Type</Text>
      
      {roles.map((role) => (
        <TouchableOpacity
          key={role.id}
          style={[
            styles.roleOption,
            selectedRole === role.id && styles.selectedRole
          ]}
          onPress={() => onRoleChange(role.id)}
        >
          <View style={styles.roleHeader}>
            <View style={[
              styles.roleIndicator,
              selectedRole === role.id && styles.selectedRoleIndicator
            ]}>
              {selectedRole === role.id && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={[
              styles.roleLabel,
              selectedRole === role.id && styles.selectedRoleLabel
            ]}>
              {role.label}
            </Text>
          </View>
          <Text style={styles.roleDescription}>{role.description}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Custom Button Component
const Button = ({ title, onPress, isPrimary = true, loading = false }) => {
  const scale = useRef(new Animated.Value(1)).current;
  
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading}
      activeOpacity={0.8}
    >
      <Animated.View 
        style={[
          styles.button,
          isPrimary ? styles.primaryButton : styles.secondaryButton,
          { transform: [{ scale }] }
        ]}
      >
        {loading ? (
          <View style={styles.loadingIndicator} />
        ) : (
          <Text 
            style={[
              styles.buttonText,
              isPrimary ? styles.primaryButtonText : styles.secondaryButtonText
            ]}
          >
            {title}
          </Text>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

const RegisterScreen = ({ navigation }: any) => {
  // Get auth context
  const { register } = useAuth();
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('USER');
  const [use2FA, setUse2FA] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  // Run animations on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(formTranslateY, {
        toValue: 0,
        duration: 800,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  // Form validation
  const validateForm = () => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    
    if (!isNotEmpty(name)) {
      newErrors.name = 'Name is required';
    }
    
    if (!isNotEmpty(email)) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    const passwordValidation = validatePassword(password, {
      minLength: 8,
      requireNumber: true,
    });
    
    if (!passwordValidation.isValid) {
      newErrors.password = passwordValidation.message;
    }
    
    if (!passwordsMatch(password, confirmPassword)) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle registration
  const handleRegister = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Call register from auth context
      await register(email, password, name, role);
      
      // Show success message
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. You can now log in.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login')
          }
        ]
      );
    } catch (error) {
      // Use the error message from our error handler
      Alert.alert('Registration Failed', error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <Animated.View 
          style={[
            styles.headerSection,
            {
              opacity: fadeAnim,
              transform: [{ translateY }]
            }
          ]}
        >
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🌱</Text>
          </View>
          <Text style={styles.appTitle}>Plant Monitor</Text>
          <Text style={styles.appSubtitle}>Create your account</Text>
        </Animated.View>
        
        {/* Form Section */}
        <Animated.View 
          style={[
            styles.formSection,
            {
              opacity: formOpacity,
              transform: [{ translateY: formTranslateY }]
            }
          ]}
        >
          <Text style={styles.formTitle}>Create Account</Text>
          <Text style={styles.formSubtitle}>Fill in your details to get started</Text>
          
          <View style={styles.formContainer}>
            <InputField
              label="Full Name"
              value={name}
              onChangeText={setName}
              placeholder="Enter your full name"
              error={errors.name}
              icon="👤"
            />
            
            <InputField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              keyboardType="email-address"
              error={errors.email}
              icon="✉️"
            />
            
            <InputField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password"
              secureTextEntry
              error={errors.password}
              icon="🔒"
            />
            
            <InputField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              secureTextEntry
              error={errors.confirmPassword}
              icon="🔒"
            />
            
            {/* Role Selection */}
            <RoleSelector 
              selectedRole={role}
              onRoleChange={setRole}
            />
            
            {/* Two-Factor Authentication */}
            <TouchableOpacity 
              style={styles.twoFactorContainer}
              onPress={() => setUse2FA(!use2FA)}
            >
              <View style={[
                styles.twoFactorCheckbox,
                use2FA && styles.twoFactorChecked
              ]}>
                {use2FA && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <View style={styles.twoFactorContent}>
                <Text style={styles.twoFactorLabel}>Enable Two-Factor Authentication</Text>
                <Text style={styles.twoFactorDescription}>
                  Enhance security with 2FA verification via email
                </Text>
              </View>
            </TouchableOpacity>
            
            <Button
              title="Create Account"
              onPress={handleRegister}
              loading={loading}
            />
            
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <Button
              title="I Already Have an Account"
              onPress={() => navigation.navigate('Login')}
              isPrimary={false}
            />
          </View>
          
          <View style={styles.termsContainer}>
            <Text style={styles.termsText}>
              By creating an account, you agree to our{' '}
              <Text style={styles.termsLink} onPress={() => Alert.alert('Terms', 'Coming soon')}>
                Terms of Service
              </Text>{' '}
              and{' '}
              <Text style={styles.termsLink} onPress={() => Alert.alert('Privacy', 'Coming soon')}>
                Privacy Policy
              </Text>
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  // Header Section
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  logoContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 32,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
  },
  // Form Section
  formSection: {
    flex: 1,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  // Input Styles
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
  },
  inputIcon: {
    padding: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  iconText: {
    fontSize: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  focusedInput: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFFFFF',
  },
  focusedLabel: {
    color: COLORS.primary,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  // Role Selector
  selectorContainer: {
    marginBottom: 20,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  roleOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
  },
  selectedRole: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedRoleIndicator: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  selectedRoleLabel: {
    color: COLORS.primary,
  },
  roleDescription: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 32,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Two-Factor Authentication
  twoFactorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingVertical: 8,
  },
  twoFactorCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  twoFactorChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  twoFactorContent: {
    flex: 1,
  },
  twoFactorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  twoFactorDescription: {
    fontSize: 12,
    color: COLORS.gray,
  },
  // Button Styles
  button: {
    borderRadius: 12,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  loadingIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderTopColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    color: COLORS.gray,
    paddingHorizontal: 16,
    fontWeight: '500',
  },
  // Terms
  termsContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  termsText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default RegisterScreen;