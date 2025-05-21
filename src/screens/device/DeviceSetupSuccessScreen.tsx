// src/screens/device/DeviceSetupSuccessScreen.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { CommonActions } from '@react-navigation/native';

// Get screen dimensions for responsive layout
const { width } = Dimensions.get('window');

const DeviceSetupSuccessScreen = ({ route, navigation }) => {
  const { device, plant } = route.params;
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const translateYAnim = useRef(new Animated.Value(50)).current;
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);
  
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  
  // Function to navigate to main app dashboard
  const goToDashboard = () => {
    // Reset navigation and go to Main screen
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Main' }],
      })
    );
  };
  
  // Function to add another plant
  const addAnotherPlant = () => {
    // Go back to the device setup flow first screen
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: 'Main' },
          { 
            name: 'DeviceSetup',
          }
        ],
      })
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View 
          style={[
            styles.successIconContainer,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
              ],
            },
          ]}
        >
          <View style={styles.successIcon}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </Animated.View>
        
        <Animated.View
          style={[
            styles.contentView,
            {
              opacity: fadeAnim,
              transform: [{ translateY: translateYAnim }],
            }
          ]}
        >
          <Text style={styles.title}>Setup Complete!</Text>
          <Text style={styles.subtitle}>
            Your plant monitor is ready to keep {plant.name} healthy and happy
          </Text>
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Plant Information</Text>
            <View style={styles.divider} />
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{plant.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>{plant.type.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>{plant.location}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Water Needs:</Text>
              <Text style={styles.infoValue}>{plant.type.waterNeeds}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device ID:</Text>
              <Text style={styles.infoValue}>{device.name}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Added On:</Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>Active</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>Getting Started</Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>1</Text>
              <Text style={styles.tipText}>
                Place your plant monitor in direct contact with the soil near your plant's roots.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>2</Text>
              <Text style={styles.tipText}>
                Fill the water reservoir to the "Max" line marked on the device.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>3</Text>
              <Text style={styles.tipText}>
                The system will automatically water your plant when needed based on soil moisture.
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipNumber}>4</Text>
              <Text style={styles.tipText}>
                Check the app dashboard regularly to monitor your plant's health and water levels.
              </Text>
            </View>
          </View>
          
          <View style={styles.buttonsContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={goToDashboard}
            >
              <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={addAnotherPlant}
            >
              <Text style={styles.secondaryButtonText}>Add Another Plant</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
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
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: 'center',
  },
  contentView: {
    width: '100%',
    alignItems: 'center',
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  checkmark: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    width: '100%',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.gray,
    textAlign: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
    width: '100%',
  },
  card: {
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignSelf: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    width: '100%',
  },
  infoLabel: {
    fontSize: 15,
    color: COLORS.gray,
    flex: 1,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 2,
    textAlign: 'right',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.success,
    marginRight: 6,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.success,
  },
  tipsCard: {
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    alignSelf: 'center',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
    width: '100%',
  },
  tipNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    color: 'white',
    textAlign: 'center',
    lineHeight: 24,
    fontWeight: 'bold',
    marginRight: 12,
  },
  tipText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  buttonsContainer: {
    width: '100%',
    alignSelf: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
    width: '100%',
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    width: '100%',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});

export default DeviceSetupSuccessScreen;