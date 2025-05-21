// First, install these packages:
// npm install react-native-ble-plx
// For iOS, add NSBluetoothAlwaysUsageDescription to Info.plist
// For Android, add BLUETOOTH permissions to AndroidManifest.xml

// src/screens/device/AddDeviceScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { BleManager, Device } from 'react-native-ble-plx';

// Initialize BLE manager
const bleManager = new BleManager();

interface DeviceInfo {
  id: string;
  name: string;
  signalStrength: string;
  device: Device;
}

const AddDeviceScreen = ({ navigation }) => {
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [permissionsGranted, setPermissionsGranted] = useState(false);

  // Request permissions on component mount
  useEffect(() => {
    requestPermissions();
    
    // Clean up BLE manager on unmount
    return () => {
      bleManager.destroy();
    };
  }, []);

  // Request necessary permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ...(Platform.Version >= 31 ? [
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
        ] : [])
      ]);
      
      // Check if all permissions are granted
      const allGranted = Object.values(granted).every(
        val => val === PermissionsAndroid.RESULTS.GRANTED
      );
      
      setPermissionsGranted(allGranted);
      
      if (!allGranted) {
        Alert.alert(
          'Permissions Required',
          'Please grant the required permissions to scan for Bluetooth devices.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // iOS handles permissions differently
      setPermissionsGranted(true);
    }
  };

  // Get signal strength label
  const getSignalStrengthLabel = (rssi: number): string => {
    if (rssi >= -50) return 'Excellent';
    if (rssi >= -60) return 'Strong';
    if (rssi >= -70) return 'Good';
    if (rssi >= -80) return 'Fair';
    return 'Weak';
  };

  // Scan for nearby BLE devices
  const scanForDevices = async () => {
    if (!permissionsGranted) {
      await requestPermissions();
      if (!permissionsGranted) return;
    }
    
    setScanning(true);
    setDevices([]);
    
    // Check if Bluetooth is powered on
    const state = await bleManager.state();
    if (state !== 'PoweredOn') {
      Alert.alert(
        'Bluetooth Required',
        'Please turn on Bluetooth to scan for devices.',
        [{ text: 'OK' }]
      );
      setScanning(false);
      return;
    }
    
    // Create a map to avoid duplicate devices
    const deviceMap = new Map<string, DeviceInfo>();
    
    // Start scanning
    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error('BLE scan error:', error);
        setScanning(false);
        Alert.alert('Scan Error', 'An error occurred while scanning for devices.');
        return;
      }
      
      // Filter for plant monitor devices
      if (device && device.name && device.name.startsWith('PlantMonitor-')) {
        const deviceId = device.name.split('-')[1] || 'Unknown';
        
        deviceMap.set(device.id, {
          id: deviceId,
          name: device.name,
          signalStrength: getSignalStrengthLabel(device.rssi || -80),
          device: device
        });
        
        // Update the devices state with values from the map
        setDevices(Array.from(deviceMap.values()));
      }
    });
    
    // Stop scanning after 10 seconds
    setTimeout(() => {
      bleManager.stopDeviceScan();
      setScanning(false);
      
      // If no devices found, show message
      if (deviceMap.size === 0) {
        Alert.alert(
          'No Devices Found',
          'Make sure your Plant Monitor device is in setup mode and Bluetooth is enabled.',
          [{ text: 'OK' }]
        );
      }
    }, 10000);
  };

  // Connect to a BLE device
  const connectToDevice = async (deviceInfo: DeviceInfo) => {
    setScanning(true);
    
    try {
      // Connect to the device
      const connectedDevice = await deviceInfo.device.connect();
      
      // Discover services and characteristics
      await connectedDevice.discoverAllServicesAndCharacteristics();
      
      // Here you would normally read characteristics to get device info
      // For now we'll use the information we already have
      
      // Get device configuration details - IMPORTANT: INCLUDE DEVICE INSTANCE
      const deviceConfig = {
        id: deviceInfo.id,
        name: deviceInfo.name,
        signalStrength: deviceInfo.signalStrength,
        device: connectedDevice // Pass the actual connected device instance
      };
      
      // Navigate to the WiFi configuration screen
      navigation.navigate('ConfigureDeviceWifi', { device: deviceConfig });
      
    } catch (error) {
      console.error('Failed to connect to device:', error);
      Alert.alert(
        'Connection Failed',
        'Could not connect to the device. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Device</Text>
        </View>
        
        <View style={styles.instructionCard}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🌱</Text>
          </View>
          <Text style={styles.instructionTitle}>How to add a new plant monitor</Text>
          <View style={styles.instructionSteps}>
            <View style={styles.step}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepText}>Power on your Plant Monitor device</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={styles.stepText}>Press and hold the setup button for 5 seconds</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepText}>Wait for the LED to blink blue (setup mode)</Text>
            </View>
            <View style={styles.step}>
              <View style={styles.stepNumberContainer}>
                <Text style={styles.stepNumber}>4</Text>
              </View>
              <Text style={styles.stepText}>Make sure your phone's Bluetooth is turned on</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={scanForDevices}
          disabled={scanning}
        >
          {scanning ? (
            <View style={styles.scanningContainer}>
              <ActivityIndicator color="white" size="small" />
              <Text style={[styles.scanButtonText, { marginLeft: 8 }]}>Scanning...</Text>
            </View>
          ) : (
            <Text style={styles.scanButtonText}>Scan for Devices</Text>
          )}
        </TouchableOpacity>
        
        {devices.length > 0 && (
          <View style={styles.devicesContainer}>
            <Text style={styles.sectionTitle}>Available Devices</Text>
            <Text style={styles.sectionSubtitle}>
              Select your device from the list below
            </Text>
            
            <FlatList
              data={devices}
              keyExtractor={(item) => item.device.id}
              renderItem={({ item }) => (
                <TouchableOpacity 
                  style={styles.deviceItem}
                  onPress={() => connectToDevice(item)}
                >
                  <View style={styles.deviceInfo}>
                    <Text style={styles.deviceName}>{item.name}</Text>
                    <Text style={styles.deviceSignal}>Signal: {item.signalStrength}</Text>
                  </View>
                  <Text style={styles.connectButton}>Connect</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}

        {!scanning && devices.length === 0 && (
          <View style={styles.noDevicesContainer}>
            <Text style={styles.noDevicesText}>No devices found</Text>
            <Text style={styles.noDevicesHint}>
              Make sure your device is in setup mode and Bluetooth is enabled
            </Text>
          </View>
        )}
        
        <View style={styles.helpContainer}>
          <TouchableOpacity 
            style={styles.helpButton}
            onPress={() => {
              Alert.alert(
                'Help',
                'If you\'re having trouble finding devices:\n\n1. Make sure Bluetooth is enabled\n2. Ensure your device is in setup mode (blue LED blinking)\n3. Check that location services are enabled\n4. Try moving closer to the device'
              );
            }}
          >
            <Text style={styles.helpButtonText}>Need Help?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    padding: 20,
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
  instructionCard: {
    backgroundColor: '#F5F8FA',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 30,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: COLORS.text,
  },
  instructionSteps: {
    width: '100%',
  },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepNumberContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumber: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepText: {
    color: '#555555',
    fontSize: 15,
    flex: 1,
  },
  scanButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  scanningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  devicesContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: COLORS.text,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F8FA',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: COLORS.text,
  },
  deviceSignal: {
    fontSize: 14,
    color: COLORS.gray,
  },
  connectButton: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 15,
  },
  noDevicesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDevicesText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 8,
  },
  noDevicesHint: {
    fontSize: 14,
    color: '#888888',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  helpContainer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  helpButton: {
    padding: 12,
  },
  helpButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
  }
});

export default AddDeviceScreen;