// src/screens/auth/LoginScreen.tsx
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
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const LoginScreen = ({ navigation }: any) => {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;
  const formTranslateY = useRef(new Animated.Value(50)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});
  
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
    
    // Check if user is already logged in
    checkAuth();
  }, []);
  
  // Check authentication status
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        navigation.replace('Main');
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
    }
  };
  
  // Test connectivity
  const testConnection = async () => {
    try {
      console.log('Testing connectivity...');
      
      // Test public API
      try {
        console.log('Testing public API access...');
        const googleResponse = await fetch('https://www.google.com');
        console.log('Public API response status:', googleResponse.status);
      } catch (e) {
        console.error('Public API test failed:', e);
      }
      
      // Test server connectivity
      try {
        const serverUrl = Platform.OS === 'android' 
          ? 'http://192.168.0.10:8080/api/auth' 
          : 'http://localhost:8080/api/auth';
        
        console.log(`Testing server at ${serverUrl}...`);
        const serverResponse = await fetch(serverUrl, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        console.log('Server response status:', serverResponse.status);
        const serverText = await serverResponse.text();
        console.log('Server response:', serverText);
      } catch (serverError) {
        console.error('Server test failed:', serverError);
      }
      
      // Try with different address
      try {
        // You may need to update this IP address to match your computer's IP
        const ipUrl = 'http://192.168.1.100:8080/api/auth';
        console.log(`Testing server at direct IP ${ipUrl}...`);
        const ipResponse = await fetch(ipUrl, { 
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        console.log('IP response status:', ipResponse.status);
      } catch (ipError) {
        console.error('IP test failed:', ipError);
      }
      
      Alert.alert('Connectivity Test', 'Check the console logs for results');
    } catch (error) {
      console.error('Connectivity test failed:', error);
      Alert.alert('Connectivity Test Failed', error.message);
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors: {email?: string; password?: string} = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle login
  const handleLogin = async () => {
    // Validate form
    if (!validateForm()) return;
    
    setLoading(true);
    console.log('Login attempt with:', email);
    
    try {
      // Create payload exactly like in Postman
      const payload = {
        email: email,
        password: password,
        deviceToken: "testtoken"
      };
      
      console.log('Request payload:', payload);
      
      // For Android emulator, you MUST use 10.0.2.2 instead of localhost
      const loginUrl = Platform.OS === 'android' 
        ? 'http://192.168.0.10:8080/api/auth/login' 
        : 'http://localhost:8080/api/auth/login';
      
      console.log('Making request to:', loginUrl);
      
      // Make login request
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      // Check if response is successful
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${responseText}`);
      }
      
      // Parse the response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Parsed response:', data);
      } catch (e) {
        console.error('Failed to parse response as JSON:', e);
        throw new Error('Invalid response from server');
      }
      
      // Check for token in response
      if (data && data.token) {
        // Store auth data
        await AsyncStorage.setItem('authToken', data.token);
        await AsyncStorage.setItem('userEmail', email);
        await AsyncStorage.setItem('userRole', data.role || 'USER');
        
        // Navigate to main screen
        navigation.replace('Main');
      } else {
        throw new Error('No token received from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different error scenarios
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  // Alternative login method using XMLHttpRequest
  const handleLoginWithXHR = () => {
    if (!validateForm()) return;
    
    setLoading(true);
    console.log('Login attempt with XHR:', email);
    
    const xhr = new XMLHttpRequest();
    
    // Set up event handlers
    xhr.onload = async function() {
      console.log('XHR status:', xhr.status);
      console.log('XHR response text:', xhr.responseText);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          console.log('Login successful:', response);
          
          // Store auth data
          await AsyncStorage.setItem('authToken', response.token);
          await AsyncStorage.setItem('userEmail', email);
          await AsyncStorage.setItem('userRole', response.role || 'USER');
          
          // Navigate to main screen
          navigation.replace('Main');
        } catch (e) {
          console.error('Failed to parse response:', e);
          Alert.alert('Error', 'Invalid response from server');
        }
      } else {
        console.error('Login failed with status:', xhr.status);
        Alert.alert('Login Failed', `Server returned status ${xhr.status}`);
      }
      
      setLoading(false);
    };
    
    xhr.onerror = function() {
      console.error('XHR error occurred');
      Alert.alert('Connection Error', 'Failed to connect to the server');
      setLoading(false);
    };
    
    xhr.ontimeout = function() {
      console.error('XHR request timed out');
      Alert.alert('Timeout', 'Request timed out');
      setLoading(false);
    };
    
    // Set up and send the request
    const loginUrl = Platform.OS === 'android' 
      ? 'http://10.0.2.2:8080/api/auth/login' 
      : 'http://localhost:8080/api/auth/login';
    
    xhr.open('POST', loginUrl, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.timeout = 10000; // 10 seconds
    
    const data = JSON.stringify({
      email: email,
      password: password,
      deviceToken: 'testtoken'
    });
    
    console.log('Sending XHR to:', loginUrl);
    console.log('With payload:', data);
    
    xhr.send(data);
  };
  
  const navigateToRegister = () => {
    navigation.navigate('Register');
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
          <Text style={styles.appSubtitle}>Take care of your green friends</Text>
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
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Login to your account</Text>
          
          <View style={styles.formContainer}>
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
              placeholder="Enter your password"
              secureTextEntry
              error={errors.password}
              icon="🔒"
            />
            
            <TouchableOpacity 
              style={styles.forgotPasswordContainer}
              onPress={() => Alert.alert('Forgot Password', 'Feature will be implemented soon')}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
            
            <Button
              title="Log In"
              onPress={handleLogin}
              loading={loading}
            />

            <TouchableOpacity 
              style={styles.altLoginButton}
              onPress={handleLoginWithXHR}
              disabled={loading}
            >
              <Text style={styles.altLoginText}>Try Alternative Login Method</Text>
            </TouchableOpacity>
            
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>
            
            <Button
              title="Register New Account"
              onPress={navigateToRegister}
              isPrimary={false}
            />

            <TouchableOpacity 
              onPress={testConnection} 
              style={styles.testButton}
            >
              <Text style={styles.testButtonText}>Test Connectivity</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.hintContainer}>
            <Text style={styles.hintText}>Hint: admin@admin.com / admin</Text>
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
    marginTop: 60,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    fontSize: 40,
  },
  appTitle: {
    fontSize: 28,
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
  // Forgot Password
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
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
  // Alt Login
  altLoginButton: {
    alignSelf: 'center',
    marginBottom: 16,
    paddingVertical: 8,
  },
  altLoginText: {
    color: COLORS.secondary || '#2196F3',
    fontSize: 14,
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
  // Test Button
  testButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    alignSelf: 'center',
  },
  testButtonText: {
    color: COLORS.gray,
    fontSize: 12,
  },
  // Hint
  hintContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  hintText: {
    color: COLORS.gray,
    fontStyle: 'italic',
  },
});

export default LoginScreen;