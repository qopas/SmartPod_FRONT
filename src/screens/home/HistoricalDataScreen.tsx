// src/screens/home/HistoricalDataScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
  Animated,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';

// Mock data directly in the component - this would be fetched from your API/database in a real app
const MOCK_DATA = {
  moistureData: {
    '24h': Array.from({ length: 24 }, (_, i) => ({
      time: `${i}:00`,
      value: Math.round(40 + Math.sin(i / 3) * 15 + Math.random() * 10),
      watering: i === 14 // Watering event at 14:00
    })),
    '7d': Array.from({ length: 7 }, (_, i) => {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      return {
        time: days[i],
        value: Math.round(45 + Math.sin(i) * 15 + Math.random() * 10),
        watering: i === 1 || i === 4 // Watering events on Monday and Thursday
      };
    }),
    '30d': Array.from({ length: 30 }, (_, i) => ({
      time: `${i+1}`,
      value: Math.round(50 + Math.sin(i / 5) * 15 + Math.random() * 8),
      watering: i % 7 === 3 // Watering events roughly weekly
    }))
  },
  
  wateringData: {
    '24h': [{ 
      timestamp: '14:00', 
      amount: 125, 
      duration: 40, 
      soilMoistureBefore: 35, 
      soilMoistureAfter: 72 
    }],
    '7d': [
      { 
        timestamp: 'Mon 10:15', 
        amount: 120, 
        duration: 35, 
        soilMoistureBefore: 31, 
        soilMoistureAfter: 70 
      },
      { 
        timestamp: 'Thu 16:30', 
        amount: 135, 
        duration: 42, 
        soilMoistureBefore: 28, 
        soilMoistureAfter: 75 
      }
    ],
    '30d': Array.from({ length: 4 }, (_, i) => ({
      timestamp: `Week ${i+1}`,
      amount: 110 + Math.round(Math.random() * 50),
      duration: 35 + Math.round(Math.random() * 15),
      soilMoistureBefore: 25 + Math.round(Math.random() * 10),
      soilMoistureAfter: 65 + Math.round(Math.random() * 15)
    }))
  }
};

const { width, height } = Dimensions.get('window');

const HistoricalDataScreen = ({ route, navigation }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('moisture'); // 'moisture' or 'watering'
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
      
      // Start animations
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 800);
    
    // If a plant was passed from the previous screen
    if (route.params?.plant) {
      setSelectedPlant(route.params.plant);
    }
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to toggle between time periods
  const handlePeriodChange = (period) => {
    setIsLoading(true);
    setSelectedPeriod(period);
    
    // Simulate loading data for the new period
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  
  // Function to render the moisture chart
  const renderMoistureChart = () => {
    const data = MOCK_DATA.moistureData[selectedPeriod];
    
    return (
      <View style={styles.chartContainer}>
        {/* Y-axis labels */}
        <View style={styles.yAxisLabels}>
          <Text style={styles.axisLabel}>100%</Text>
          <Text style={styles.axisLabel}>75%</Text>
          <Text style={styles.axisLabel}>50%</Text>
          <Text style={styles.axisLabel}>25%</Text>
          <Text style={styles.axisLabel}>0%</Text>
        </View>
        
        {/* Chart content */}
        <View style={styles.chartContent}>
          {/* Background grid */}
          <View style={styles.gridContainer}>
            <View style={[styles.gridLine, { top: '0%' }]} />
            <View style={[styles.gridLine, { top: '25%' }]} />
            <View style={[styles.gridLine, { top: '50%' }]} />
            <View style={[styles.gridLine, { top: '75%' }]} />
            <View style={[styles.gridLine, { top: '100%', opacity: 0.5 }]} />
            
            {/* Optimal moisture zone */}
            <View style={styles.optimalZone} />
          </View>
          
          {/* Data points and lines */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.dataPointsContainer,
              { width: Math.max(width - 50, data.length * 50) }
            ]}
          >
            {data.map((item, index) => {
              // Calculate position based on value
              const heightPercentage = (item.value / 100) * 100;
              const hasWatering = item.watering;
              
              return (
                <View 
                  key={index} 
                  style={[
                    styles.dataPointColumn,
                    { width: `${100 / data.length}%` }
                  ]}
                >
                  {/* Line to previous point (if not first point) */}
                  {index > 0 && (
                    <View
                      style={[
                        styles.connectingLine,
                        {
                          bottom: `${(data[index-1].value / 100) * 100}%`,
                          width: `${100 / data.length}%`,
                          height: Math.abs(data[index-1].value - item.value) / 100 * 100 + '%',
                          transform: [
                            { translateX: -25 },
                            { 
                              rotateZ: data[index-1].value > item.value 
                                ? `${Math.atan(1) * -1}rad` 
                                : `${Math.atan(1)}rad` 
                            }
                          ]
                        }
                      ]}
                    />
                  )}
                  
                  {/* Data point */}
                  <TouchableOpacity
                    style={[
                      styles.dataPoint,
                      { bottom: `${heightPercentage}%` },
                      hasWatering && styles.wateringEventPoint
                    ]}
                    onPress={() => {
                      alert(`Moisture reading: ${item.value}%\nTime: ${item.time}${hasWatering ? '\nWatering event occurred' : ''}`);
                    }}
                  >
                    {hasWatering && (
                      <View style={styles.waterDropIndicator}>
                        <Text style={styles.waterDropText}>💧</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  
                  {/* X-axis label */}
                  <Text style={styles.xAxisLabel}>{item.time}</Text>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };
  
  // Function to render watering history
  const renderWateringHistory = () => {
    const events = MOCK_DATA.wateringData[selectedPeriod];
    
    return (
      <ScrollView style={styles.wateringHistoryContainer}>
        {events.map((event, index) => (
          <View key={index} style={styles.wateringEventCard}>
            <View style={styles.wateringEventHeader}>
              <Text style={styles.wateringEventTime}>{event.timestamp}</Text>
              <View style={styles.wateringEventAmount}>
                <Text style={styles.wateringAmountText}>{event.amount} ml</Text>
              </View>
            </View>
            
            <View style={styles.moistureChangeIndicator}>
              <View style={styles.moistureChangeBar}>
                <View style={[
                  styles.moistureChangeBarBefore,
                  { width: `${event.soilMoistureBefore}%` }
                ]} />
                <View style={[
                  styles.moistureChangeBarAfter,
                  { width: `${event.soilMoistureAfter - event.soilMoistureBefore}%` }
                ]} />
              </View>
              <View style={styles.moistureChangeLabels}>
                <Text style={styles.moistureValueBefore}>{event.soilMoistureBefore}%</Text>
                <Text style={styles.moistureArrow}>→</Text>
                <Text style={styles.moistureValueAfter}>{event.soilMoistureAfter}%</Text>
              </View>
            </View>
            
            <View style={styles.wateringEventDetails}>
              <View style={styles.wateringDetailItem}>
                <Text style={styles.wateringDetailLabel}>Duration:</Text>
                <Text style={styles.wateringDetailValue}>{event.duration} sec</Text>
              </View>
              
              <View style={styles.wateringDetailItem}>
                <Text style={styles.wateringDetailLabel}>Flow Rate:</Text>
                <Text style={styles.wateringDetailValue}>
                  {Math.round(event.amount / event.duration * 60)} ml/min
                </Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedPlant ? selectedPlant.name : 'Historical Data'}
        </Text>
      </View>
      
      {/* Time Period Selector */}
      <View style={styles.periodSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.periodOption,
            selectedPeriod === '24h' && styles.selectedPeriodOption
          ]}
          onPress={() => handlePeriodChange('24h')}
        >
          <Text 
            style={[
              styles.periodOptionText,
              selectedPeriod === '24h' && styles.selectedPeriodText
            ]}
          >
            24 Hours
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.periodOption,
            selectedPeriod === '7d' && styles.selectedPeriodOption
          ]}
          onPress={() => handlePeriodChange('7d')}
        >
          <Text 
            style={[
              styles.periodOptionText,
              selectedPeriod === '7d' && styles.selectedPeriodText
            ]}
          >
            7 Days
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.periodOption,
            selectedPeriod === '30d' && styles.selectedPeriodOption
          ]}
          onPress={() => handlePeriodChange('30d')}
        >
          <Text 
            style={[
              styles.periodOptionText,
              selectedPeriod === '30d' && styles.selectedPeriodText
            ]}
          >
            30 Days
          </Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Selector */}
      <View style={styles.tabSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.tabOption,
            activeTab === 'moisture' && styles.selectedTabOption
          ]}
          onPress={() => setActiveTab('moisture')}
        >
          <Text 
            style={[
              styles.tabOptionText,
              activeTab === 'moisture' && styles.selectedTabText
            ]}
          >
            Moisture Trends
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tabOption,
            activeTab === 'watering' && styles.selectedTabOption
          ]}
          onPress={() => setActiveTab('watering')}
        >
          <Text 
            style={[
              styles.tabOptionText,
              activeTab === 'watering' && styles.selectedTabText
            ]}
          >
            Watering History
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.animatedContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY }],
              }
            ]}
          >
            {/* Chart or Watering History based on active tab */}
            <View style={styles.chartSection}>
              <Text style={styles.sectionTitle}>
                {activeTab === 'moisture' ? 'Soil Moisture Trends' : 'Watering Events'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {activeTab === 'moisture' 
                  ? `Showing soil moisture levels over the last ${selectedPeriod === '24h' ? '24 hours' : selectedPeriod === '7d' ? '7 days' : '30 days'}`
                  : `Showing watering events over the last ${selectedPeriod === '24h' ? '24 hours' : selectedPeriod === '7d' ? '7 days' : '30 days'}`
                }
              </Text>
              
              <View style={styles.chartLegend}>
                {activeTab === 'moisture' ? (
                  <>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: COLORS.primary }]} />
                      <Text style={styles.legendText}>Moisture Level</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: '#3498db' }]} />
                      <Text style={styles.legendText}>Watering Event</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: 'rgba(144, 238, 144, 0.3)' }]} />
                      <Text style={styles.legendText}>Optimal Range</Text>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: '#ff7979' }]} />
                      <Text style={styles.legendText}>Before Watering</Text>
                    </View>
                    <View style={styles.legendItem}>
                      <View style={[styles.legendColor, { backgroundColor: '#55efc4' }]} />
                      <Text style={styles.legendText}>After Watering</Text>
                    </View>
                  </>
                )}
              </View>
              
              {activeTab === 'moisture' ? renderMoistureChart() : renderWateringHistory()}
            </View>
            
            {/* Water Usage Statistics */}
            <View style={styles.statsSection}>
              <Text style={styles.sectionTitle}>Watering Statistics</Text>
              
              <View style={styles.statsCards}>
                <View style={styles.statsCard}>
                  <View style={styles.statsIconContainer}>
                    <Text style={styles.statsIcon}>💧</Text>
                  </View>
                  <Text style={styles.statsValue}>
                    {selectedPeriod === '24h' ? '125 ml' : selectedPeriod === '7d' ? '255 ml' : '1,245 ml'}
                  </Text>
                  <Text style={styles.statsLabel}>Water Used</Text>
                </View>
                
                <View style={styles.statsCard}>
                  <View style={styles.statsIconContainer}>
                    <Text style={styles.statsIcon}>⏱️</Text>
                  </View>
                  <Text style={styles.statsValue}>
                    {selectedPeriod === '24h' ? '40 sec' : selectedPeriod === '7d' ? '77 sec' : '352 sec'}
                  </Text>
                  <Text style={styles.statsLabel}>Pump Time</Text>
                </View>
                
                <View style={styles.statsCard}>
                  <View style={styles.statsIconContainer}>
                    <Text style={styles.statsIcon}>📈</Text>
                  </View>
                  <Text style={styles.statsValue}>
                    {selectedPeriod === '24h' ? '+37%' : selectedPeriod === '7d' ? '+43%' : '+41%'}
                  </Text>
                  <Text style={styles.statsLabel}>Moisture Gain</Text>
                </View>
              </View>
            </View>
            
            {/* Next Watering Prediction */}
            <View style={styles.predictionSection}>
              <Text style={styles.sectionTitle}>Next Watering Prediction</Text>
              
              <View style={styles.predictionCard}>
                <View style={styles.predictionHeader}>
                  <View style={styles.predictionIconContainer}>
                    <Text style={styles.predictionIcon}>🔮</Text>
                  </View>
                  <View style={styles.predictionHeaderContent}>
                    <Text style={styles.predictionTitle}>Expected in 2 days</Text>
                    <Text style={styles.predictionTime}>Wednesday, April 30 - Around 4:30 PM</Text>
                  </View>
                </View>
                
                <View style={styles.predictionDetails}>
                  <View style={styles.predictionRow}>
                    <Text style={styles.predictionLabel}>Current Moisture:</Text>
                    <Text style={styles.predictionValue}>64%</Text>
                  </View>
                  <View style={styles.predictionRow}>
                    <Text style={styles.predictionLabel}>Depletion Rate:</Text>
                    <Text style={styles.predictionValue}>~8% per day</Text>
                  </View>
                  <View style={styles.predictionRow}>
                    <Text style={styles.predictionLabel}>Threshold:</Text>
                    <Text style={styles.predictionValue}>40%</Text>
                  </View>
                  <View style={styles.predictionProgressRow}>
                    <View style={styles.predictionProgressContainer}>
                      <View style={styles.predictionProgress} />
                      <Text style={styles.predictionProgressText}>67% Confidence</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            
            {/* Export Button */}
            <View style={styles.exportSection}>
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => alert('Data export will be implemented in a future update')}
              >
                <Text style={styles.exportButtonText}>Export Data</Text>
              </TouchableOpacity>
              <Text style={styles.exportHint}>
                Export historical data as CSV for detailed analysis
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  periodSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
  },
  periodOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  selectedPeriodOption: {
    backgroundColor: COLORS.primary,
  },
  periodOptionText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  selectedPeriodText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tabSelectorContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 10,
    borderRadius: 4,
  },
  selectedTabOption: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabOptionText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  selectedTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  animatedContent: {
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.gray,
  },
  chartSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 15,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  chartContainer: {
    height: 250,
    flexDirection: 'row',
    marginBottom: 30,
    marginTop: 10,
  },
  yAxisLabels: {
    width: 40,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  axisLabel: {
    fontSize: 10,
    color: COLORS.gray,
  },
  chartContent: {
    flex: 1,
    height: '100%',
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  optimalZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '25%',
    height: '25%',
    backgroundColor: 'rgba(144, 238, 144, 0.3)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  dataPointsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  dataPointColumn: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  connectingLine: {
    position: 'absolute',
    height: 2,
    backgroundColor: COLORS.primary,
  },
  dataPoint: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
    position: 'absolute',
  },
  wateringEventPoint: {
    backgroundColor: '#3498db',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  waterDropIndicator: {
    position: 'absolute',
    top: -20,
    left: -10,
  },
  waterDropText: {
    fontSize: 16,
  },
  xAxisLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 5,
    position: 'absolute',
    bottom: -20,
  },
  wateringHistoryContainer: {
    marginTop: 10,
  },
  wateringEventCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  wateringEventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  wateringEventTime: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  wateringEventAmount: {
    backgroundColor: '#3498db',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  wateringAmountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  moistureChangeIndicator: {
    marginBottom: 15,
  },
  moistureChangeBar: {
    height: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 5,
  },
  moistureChangeBarBefore: {
    height: '100%',
    backgroundColor: '#ff7979',
  },
  moistureChangeBarAfter: {
    height: '100%',
    backgroundColor: '#55efc4',
  },
  moistureChangeLabels: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  moistureValueBefore: {
    fontSize: 12,
    color: '#ff7979',
    fontWeight: '600',
  },
  moistureArrow: {
    marginHorizontal: 5,
    fontSize: 12,
    color: COLORS.gray,
  },
  moistureValueAfter: {
    fontSize: 12,
    color: '#55efc4',
    fontWeight: '600',
  },
  wateringEventDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  wateringDetailItem: {
    flex: 1,
  },
  wateringDetailLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 2,
  },
  wateringDetailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  statsSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  statsCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  statsCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    margin: 5,
    alignItems: 'center',
  },
  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statsIcon: {
    fontSize: 20,
  },
  statsValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  statsLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  predictionSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  predictionCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  predictionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  predictionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  predictionIcon: {
    fontSize: 20,
  },
  predictionHeaderContent: {
    flex: 1,
  },
  predictionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  predictionTime: {
    fontSize: 12,
    color: COLORS.gray,
  },
  predictionDetails: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  predictionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  predictionLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },
  predictionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  predictionProgressRow: {
    marginTop: 5,
  },
  predictionProgressContainer: {
    height: 24,
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  predictionProgress: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '67%',
    backgroundColor: COLORS.primary,
  },
  predictionProgressText: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  exportSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  exportButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  exportHint: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  }
});

export default HistoricalDataScreen;