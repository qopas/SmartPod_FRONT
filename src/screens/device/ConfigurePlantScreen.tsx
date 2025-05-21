// src/screens/device/ConfigurePlantScreen.tsx
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
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';

const plantTypes = [
  { id: 'snake_plant', name: 'Snake Plant', waterNeeds: 'Low' },
  { id: 'peace_lily', name: 'Peace Lily', waterNeeds: 'Medium' },
  { id: 'money_plant', name: 'Money Plant', waterNeeds: 'Low to Medium' },
  { id: 'aloe_vera', name: 'Aloe Vera', waterNeeds: 'Low' },
  { id: 'fiddle_leaf', name: 'Fiddle Leaf Fig', waterNeeds: 'Medium' },
  { id: 'spider_plant', name: 'Spider Plant', waterNeeds: 'Low to Medium' },
  { id: 'monstera', name: 'Monstera', waterNeeds: 'Medium' },
];

// A simple plant type selector card component
const PlantTypeCard = ({ plant, selected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.plantTypeCard, selected && styles.selectedPlantTypeCard]}
      onPress={() => onSelect(plant.id)}
    >
      <View style={styles.plantTypeHeader}>
        <View style={[styles.plantTypeIndicator, selected && styles.selectedPlantTypeIndicator]}>
          {selected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.plantTypeInfo}>
          <Text style={[styles.plantTypeName, selected && styles.selectedPlantTypeName]}>
            {plant.name}
          </Text>
          <Text style={styles.plantTypeWaterNeeds}>
            Water Needs: {plant.waterNeeds}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ConfigurePlantScreen = ({ route, navigation }) => {
  const { device } = route.params;
  const [plantName, setPlantName] = useState('');
  const [selectedPlantType, setSelectedPlantType] = useState('');
  const [location, setLocation] = useState('Living Room');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Predefined location options (you could expand this)
  const locationOptions = [
    'Living Room', 'Bedroom', 'Kitchen', 'Office', 'Balcony', 'Patio'
  ];

  const validateInputs = () => {
    if (!plantName.trim()) {
      setValidationError('Please give your plant a name');
      return false;
    }
    
    if (!selectedPlantType) {
      setValidationError('Please select a plant type');
      return false;
    }
    
    setValidationError('');
    return true;
  };

  const completeSetup = () => {
    if (!validateInputs()) return;
    
    setIsConfiguring(true);
    
    // Simulate device configuration process
    setTimeout(() => {
      setIsConfiguring(false);
      
      // Navigate to setup complete screen
      navigation.navigate('DeviceSetupSuccess', { 
        device,
        plant: {
          name: plantName,
          type: plantTypes.find(p => p.id === selectedPlantType),
          location,
        }
      });
    }, 2500);
  };

  const handleSelectPlantType = (plantId) => {
    setSelectedPlantType(plantId);
    setValidationError('');
  };

  const handleSelectLocation = (loc) => {
    setLocation(loc);
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
            <Text style={styles.headerTitle}>Plant Setup</Text>
          </View>

          <View style={styles.progressSteps}>
            <View style={styles.progressStep}>
              <View style={[styles.stepIndicator, styles.completedStep]}>
                <Text style={styles.stepNumber}>1</Text>
              </View>
              <Text style={styles.stepName}>WiFi</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={[styles.stepIndicator, styles.activeStep]}>
                <Text style={styles.stepNumber}>2</Text>
              </View>
              <Text style={[styles.stepName, styles.activeStepName]}>Plant</Text>
            </View>
            <View style={styles.progressLine} />
            <View style={styles.progressStep}>
              <View style={[styles.stepIndicator, styles.inactiveStep]}>
                <Text style={styles.stepNumber}>3</Text>
              </View>
              <Text style={styles.stepName}>Done</Text>
            </View>
          </View>

          <View style={styles.deviceInfo}>
            <Text style={styles.deviceInfoTitle}>Configuring Device:</Text>
            <Text style={styles.deviceName}>{device.name}</Text>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Plant Information</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Plant Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a name for your plant"
                value={plantName}
                onChangeText={(text) => {
                  setPlantName(text);
                  setValidationError('');
                }}
                editable={!isConfiguring}
              />
            </View>

            <Text style={styles.groupLabel}>Plant Type</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.plantTypesContainer}
              contentContainerStyle={styles.plantTypesContent}
            >
              {plantTypes.map((plant) => (
                <PlantTypeCard
                  key={plant.id}
                  plant={plant}
                  selected={selectedPlantType === plant.id}
                  onSelect={handleSelectPlantType}
                />
              ))}
            </ScrollView>

            <Text style={styles.groupLabel}>Location</Text>
            <View style={styles.locationContainer}>
              {locationOptions.map((loc) => (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.locationOption,
                    location === loc && styles.selectedLocationOption
                  ]}
                  onPress={() => handleSelectLocation(loc)}
                  disabled={isConfiguring}
                >
                  <Text
                    style={[
                      styles.locationText,
                      location === loc && styles.selectedLocationText
                    ]}
                  >
                    {loc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {validationError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{validationError}</Text>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.completeButton, isConfiguring ? styles.disabledButton : null]}
            onPress={completeSetup}
            disabled={isConfiguring}
          >
            {isConfiguring ? (
              <View style={styles.configuringContainer}>
                <ActivityIndicator color="white" size="small" />
                <Text style={styles.completeButtonText}>Setting up...</Text>
              </View>
            ) : (
              <Text style={styles.completeButtonText}>Complete Setup</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.optimizationText}>
            Plant water settings will be automatically optimized for your selected plant type.
          </Text>
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
  progressSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  progressStep: {
    alignItems: 'center',
  },
  progressLine: {
    flex: 1,
    height: 2,
    backgroundColor: COLORS.lightGray,
    marginHorizontal: 5,
  },
  stepIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  completedStep: {
    backgroundColor: COLORS.success,
  },
  activeStep: {
    backgroundColor: COLORS.primary,
  },
  inactiveStep: {
    backgroundColor: COLORS.lightGray,
  },
  stepNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  stepName: {
    fontSize: 12,
    color: COLORS.gray,
  },
  activeStepName: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  deviceInfo: {
    marginBottom: 24,
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
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
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
  groupLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
    marginTop: 8,
  },
  plantTypesContainer: {
    marginBottom: 20,
  },
  plantTypesContent: {
    paddingRight: 20,
  },
  plantTypeCard: {
    width: 150,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    padding: 12,
    backgroundColor: '#F8F8F8',
  },
  selectedPlantTypeCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  plantTypeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantTypeIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedPlantTypeIndicator: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  plantTypeInfo: {
    flex: 1,
  },
  plantTypeName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  selectedPlantTypeName: {
    color: COLORS.primary,
  },
  plantTypeWaterNeeds: {
    fontSize: 12,
    color: COLORS.gray,
  },
  locationContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  locationOption: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#F8F8F8',
  },
  selectedLocationOption: {
    borderColor: COLORS.primary,
    backgroundColor: '#F0F7FF',
  },
  locationText: {
    fontSize: 14,
    color: COLORS.text,
  },
  selectedLocationText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledButton: {
    opacity: 0.7,
  },
  configuringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  optimizationText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ConfigurePlantScreen;