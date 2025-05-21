// src/screens/device/ConfigureDeviceWifiScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import NetInfo from '@react-native-community/netinfo';

// UUID Constants (must match those in your ESP32 code)
const SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const DEVICE_INFO_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8";
const WIFI_CONFIG_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a9";

const ConfigureDeviceWifiScreen = ({ route, navigation }) => {
  const { device } = route.params;
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [userEmail, setUserEmail] = useState('user@example.com'); // In a real app, get from user account
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({
    ssid: '',
    password: '',
  });
  const [deviceInfo, setDeviceInfo] = useState(null);

  // Get current WiFi SSID on component mount
  useEffect(() => {
    getCurrentWiFiSSID();
    readDeviceInfo();
    
    return () => {
      // No need to disconnect here as we want to keep the connection
      // for the next screen in the flow
    };
  }, []);

  // Get the current WiFi network SSID
  const getCurrentWiFiSSID = async () => {
    try {
      const netInfo = await NetInfo.fetch();
      if (netInfo.type === 'wifi' && netInfo.isConnected && netInfo.details?.ssid) {
        setSsid(netInfo.details.ssid);
      }
    } catch (error) {
      console.error('Error getting WiFi SSID:', error);
    }
  };

  // Read device info from the BLE characteristic
  const readDeviceInfo = async () => {
    try {
      // Add debug logging to see what's in device object
      console.log("Device object received:", JSON.stringify(device));
      
      if (!device || !device.device) {
        console.error('Device instance not available', device);
        Alert.alert(
          'Connection Issue',
          'Device connection information is missing. Please go back and reconnect to the device.',
          [{
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        );
        return;
      }
      
      try {
        const characteristic = await device.device.readCharacteristicForService(
          SERVICE_UUID,
          DEVICE_INFO_CHAR_UUID
        );
        
        if (characteristic && characteristic.value) {
          try {
            // The characteristic.value is already a base64 string
            // First, convert base64 to binary string
            const binaryString = atob(characteristic.value);
            
            // Convert binary string to text string
            const textString = Array.from(binaryString)
              .map(char => char.charCodeAt(0))
              .map(byte => String.fromCharCode(byte))
              .join('');
            
            // Parse as JSON
            const info = JSON.parse(textString);
            setDeviceInfo(info);
            console.log('Device info successfully read:', info);
          } catch (parseError) {
            console.error('Error parsing device info:', parseError);
          }
        } else {
          console.log('No characteristic value returned');
        }
      } catch (characteristicError) {
        console.error('Error reading characteristic:', characteristicError);
        // Don't show an alert here, as this is not critical for the user experience
      }
    } catch (error) {
      console.error('Error in readDeviceInfo:', error);
    }
  };

  // Send WiFi configuration to the device via BLE
  const sendWiFiConfig = async () => {
    try {
      if (!device || !device.device) {
        console.error('Device instance not available for sending WiFi config', device);
        Alert.alert(
          'Connection Error',
          'Device connection not available. Please go back and try again.'
        );
        return false;
      }
      
      // Prepare the configuration data
      const config = {
        ssid: ssid,
        password: password,
        email: userEmail
      };
      
      // Convert to JSON string
      const configStr = JSON.stringify(config);
      
      console.log('Sending WiFi config to device:', configStr);
      
      try {
        // Convert string to Base64 for BLE transmission
        // In JavaScript, btoa encodes a string to base64
        const base64Config = btoa(configStr);
        
        // Write to the characteristic
        await device.device.writeCharacteristicWithResponseForService(
          SERVICE_UUID,
          WIFI_CONFIG_CHAR_UUID,
          base64Config
        );
        
        console.log('WiFi configuration sent successfully');
        return true;
      } catch (writeError) {
        console.error('Error writing to characteristic:', writeError);
        Alert.alert(
          'Configuration Failed',
          'Could not send data to the device. Please make sure the device is still in setup mode and try again.'
        );
        return false;
      }
    } catch (error) {
      console.error('Error sending WiFi configuration:', error);
      Alert.alert(
        'Configuration Failed',
        'Failed to send WiFi configuration to the device. Please try again.'
      );
      return false;
    }
  };

  // Validate the form inputs
  const validateInputs = () => {
    const errors = {
      ssid: '',
      password: '',
    };
    
    if (!ssid.trim()) {
      errors.ssid = 'WiFi name is required';
    }
    
    if (!password.trim()) {
      errors.password = 'WiFi password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    setValidationErrors(errors);
    return !errors.ssid && !errors.password;
  };

  // Handle the configuration process
  const handleConfigureDevice = async () => {
    if (!validateInputs()) return;
    
    // Check if device is available before proceeding
    if (!device || !device.device) {
      Alert.alert(
        'Connection Error',
        'Device connection not available. Please go back and try again.',
        [{
          text: 'OK',
          onPress: () => navigation.goBack()
        }]
      );
      return;
    }
    
    setIsConfiguring(true);
    
    try {
      // Verify connection is still active
      try {
        await device.device.isConnected();
      } catch (connectionError) {
        console.error('Device is no longer connected:', connectionError);
        Alert.alert(
          'Device Disconnected',
          'The device appears to be disconnected. Please go back and reconnect.',
          [{
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        );
        setIsConfiguring(false);
        return;
      }
      
      // Send WiFi configuration
      const configSent = await sendWiFiConfig();
      
      if (configSent) {
        Alert.alert(
          'Configuration Successful',
          'WiFi credentials sent successfully. Your device will now connect to your network.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate to the next screen
                navigation.navigate('ConfigurePlant', { device });
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error configuring device:', error);
      Alert.alert(
        'Error',
        'Failed to configure the device. Please try again.'
      );
    } finally {
      setIsConfiguring(false);
    }
  };

  // Render device status information if available
  const renderDeviceStatus = () => {
    if (deviceInfo) {
      return (
        <View style={styles.deviceStatusContainer}>
          <Text style={styles.deviceStatusTitle}>Device Status:</Text>
          <Text style={styles.deviceStatusText}>
            State: {deviceInfo.state || 'Unknown'}
          </Text>
          {deviceInfo.wifiStatus && (
            <Text style={styles.deviceStatusText}>
              WiFi: {deviceInfo.wifiStatus.connected ? 
                `Connected to ${deviceInfo.wifiStatus.ssid}` : 
                'Not connected'}
            </Text>
          )}
        </View>
      );
    } else {
      // Fallback UI when device info can't be read
      return (
        <View style={styles.deviceStatusContainer}>
          <Text style={styles.deviceStatusTitle}>Device Status:</Text>
          <Text style={styles.deviceStatusText}>
            Device is ready for configuration
          </Text>
          <Text style={[styles.deviceStatusText, styles.deviceStatusHint]}>
            Enter your WiFi details below to connect your device
          </Text>
        </View>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 20 : 0}
      >
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              disabled={isConfiguring}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>WiFi Setup</Text>
          </View>

          <View style={styles.deviceInfo}>
            <Text style={styles.deviceInfoTitle}>Configuring Device:</Text>
            <Text style={styles.deviceName}>{device.name}</Text>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Device:</Text>
              <View style={styles.statusBadgeContainer}>
                <View style={[
                  styles.statusIndicator,
                  { backgroundColor: COLORS.success }
                ]} />
                <Text style={styles.statusBadgeText}>Connected</Text>
              </View>
            </View>
            
            {renderDeviceStatus()}
          </View>

          <View style={styles.instructionCard}>
            <Text style={styles.instructionTitle}>Connect Your Device to WiFi</Text>
            <Text style={styles.instructionText}>
              Please enter your home WiFi details below. Your plant monitor will use these to connect to your network.
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>WiFi Network Name</Text>
              <TextInput
                style={[styles.input, validationErrors.ssid ? styles.inputError : null]}
                placeholder="Enter your WiFi name (SSID)"
                value={ssid}
                onChangeText={setSsid}
                autoCapitalize="none"
                editable={!isConfiguring}
              />
              {validationErrors.ssid ? (
                <Text style={styles.errorText}>{validationErrors.ssid}</Text>
              ) : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>WiFi Password</Text>
              <View style={[styles.passwordContainer, validationErrors.password ? styles.inputError : null]}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your WiFi password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!isConfiguring}
                />
                <TouchableOpacity
                  style={styles.showPasswordButton}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isConfiguring}
                >
                  <Text style={styles.showPasswordText}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </TouchableOpacity>
              </View>
              {validationErrors.password ? (
                <Text style={styles.errorText}>{validationErrors.password}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.configureButton,
                isConfiguring ? styles.disabledButton : null
              ]}
              onPress={handleConfigureDevice}
              disabled={isConfiguring}
            >
              {isConfiguring ? (
                <View style={styles.rowCenter}>
                  <ActivityIndicator color="white" size="small" />
                  <Text style={styles.configureButtonText}>Configuring...</Text>
                </View>
              ) : (
                <Text style={styles.configureButtonText}>Configure WiFi</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.securityNote}>
            <Text style={styles.securityText}>
              Your WiFi credentials are sent securely via Bluetooth and are not stored by us.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 28,
    color: COLORS.text,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  deviceInfo: {
    marginBottom: 16,
  },
  deviceInfoTitle: {
    fontSize: 16,
    color: COLORS.gray,
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  statusCard: {
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusBadgeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceStatusContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  deviceStatusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  deviceStatusText: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  deviceStatusHint: {
    fontStyle: 'italic',
    fontSize: 12,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionCard: {
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.gray,
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F8F8F8',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  passwordContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
  },
  showPasswordButton: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  showPasswordText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  configureButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  configureButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  securityNote: {
    alignItems: 'center',
    marginTop: 8,
  },
  securityText: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  }
});

export default ConfigureDeviceWifiScreen;