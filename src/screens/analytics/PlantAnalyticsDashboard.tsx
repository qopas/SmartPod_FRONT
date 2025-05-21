// src/screens/analytics/PlantAnalyticsDashboard.tsx
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

// Mock data for plant list
const PLANT_LIST = [
  { id: '1', name: 'Snake Plant', type: 'Sansevieria', lastWatered: '2025-04-27T08:30:00', status: 'healthy' },
  { id: '2', name: 'Peace Lily', type: 'Spathiphyllum', lastWatered: '2025-04-26T10:15:00', status: 'needs_water' },
  { id: '3', name: 'Money Plant', type: 'Epipremnum aureum', lastWatered: '2025-04-25T16:45:00', status: 'needs_attention' },
];

// Mock data for water usage analytics
const WATER_USAGE_DATA = {
  '24h': [
    { time: '00:00', amount: 0 },
    { time: '06:00', amount: 0 },
    { time: '12:00', amount: 125 },
    { time: '18:00', amount: 0 },
  ],
  '7d': [
    { time: 'Mon', amount: 120 },
    { time: 'Tue', amount: 0 },
    { time: 'Wed', amount: 145 },
    { time: 'Thu', amount: 0 },
    { time: 'Fri', amount: 0 },
    { time: 'Sat', amount: 105 },
    { time: 'Sun', amount: 0 },
  ],
  '30d': [
    { time: 'Week 1', amount: 370 },
    { time: 'Week 2', amount: 425 },
    { time: 'Week 3', amount: 360 },
    { time: 'Week 4', amount: 390 },
  ],
};

// Weekly summary data
const WEEKLY_SUMMARY = {
  totalWaterUsed: 370, // ml
  wateringEvents: 3,
  avgMoistureIncrease: 38, // percentage points
  mostActiveDay: 'Wednesday',
};

// System health data
const SYSTEM_HEALTH = {
  batteryLevel: 78, // percentage
  wifiSignal: 'Strong',
  lastSync: '2025-04-28T09:15:22',
  reservoirLevel: 65, // percentage
};

const { width } = Dimensions.get('window');

const PlantAnalyticsDashboard = ({ navigation }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(true);
  
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
    
    return () => clearTimeout(timer);
  }, []);
  
  // Function to change time range
  const handleTimeRangeChange = (period) => {
    setIsLoading(true);
    setTimeRange(period);
    
    // Simulate loading data for the new time range
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };
  
  // Function to view detailed plant analytics
  const viewPlantDetails = (plant) => {
    navigation.navigate('HistoricalData', { plant });
  };
  
  // Function to render the water usage chart
  const renderWaterUsageChart = () => {
    const data = WATER_USAGE_DATA[timeRange];
    const maxAmount = Math.max(...data.map(item => item.amount));
    
    return (
      <View style={styles.chartContainer}>
        <View style={styles.chartYAxis}>
          <Text style={styles.chartYLabel}>{maxAmount} ml</Text>
          <Text style={styles.chartYLabel}>{Math.round(maxAmount / 2)} ml</Text>
          <Text style={styles.chartYLabel}>0 ml</Text>
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[
            styles.barChartContainer,
            { width: Math.max(width - 70, data.length * 70) }
          ]}
        >
          {data.map((item, index) => {
            const barHeight = item.amount > 0 
              ? (item.amount / maxAmount) * 180
              : 0;
              
            return (
              <View key={index} style={styles.barColumn}>
                <Text style={styles.barValue}>
                  {item.amount > 0 ? `${item.amount} ml` : ''}
                </Text>
                <View style={styles.barWrapper}>
                  <View 
                    style={[
                      styles.bar,
                      { height: barHeight }
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{item.time}</Text>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  };
  
  // Function to render upcoming watering predictions
  const renderWateringPredictions = () => {
    // Sample prediction data
    const predictions = [
      { plant: 'Peace Lily', day: 'Tomorrow', time: 'Around 2:00 PM', confidence: 89 },
      { plant: 'Snake Plant', day: 'In 4 days', time: 'Around 10:00 AM', confidence: 73 },
      { plant: 'Money Plant', day: 'In 6 days', time: 'Around 5:30 PM', confidence: 65 },
    ];
    
    return (
      <View style={styles.predictionsContainer}>
        {predictions.map((prediction, index) => (
          <View key={index} style={styles.predictionItem}>
            <View style={styles.predictionHeader}>
              <Text style={styles.predictionPlant}>{prediction.plant}</Text>
              <View 
                style={[
                  styles.confidenceBadge,
                  prediction.confidence > 80 
                    ? styles.highConfidence 
                    : prediction.confidence > 60
                      ? styles.mediumConfidence
                      : styles.lowConfidence
                ]}
              >
                <Text style={styles.confidenceText}>{prediction.confidence}%</Text>
              </View>
            </View>
            
            <View style={styles.predictionDetails}>
              <View style={styles.predictionTimeContainer}>
                <Text style={styles.predictionDay}>{prediction.day}</Text>
                <Text style={styles.predictionTime}>{prediction.time}</Text>
              </View>
              <TouchableOpacity 
                style={styles.viewDetailsButton}
                onPress={() => viewPlantDetails(
                  PLANT_LIST.find(p => p.name === prediction.plant)
                )}
              >
                <Text style={styles.viewDetailsText}>View</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    );
  };
  
  // Function to render all plants list
  const renderPlantsList = () => {
    return (
      <View style={styles.plantListContainer}>
        {PLANT_LIST.map((plant, index) => {
          // Calculate time since last watering
          const lastWatered = new Date(plant.lastWatered);
          const now = new Date();
          const diffTime = Math.abs(now - lastWatered);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          
          let timeText = '';
          if (diffDays > 0) {
            timeText = `${diffDays}d ago`;
          } else {
            timeText = `${diffHours}h ago`;
          }
          
          // Status color
          const statusColor = plant.status === 'healthy' 
            ? COLORS.success 
            : plant.status === 'needs_water' 
              ? COLORS.warning 
              : COLORS.error;
          
          return (
            <TouchableOpacity
              key={index}
              style={styles.plantCard}
              onPress={() => viewPlantDetails(plant)}
            >
              <View style={styles.plantInfo}>
                <View style={styles.plantNameRow}>
                  <Text style={styles.plantName}>{plant.name}</Text>
                  <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                </View>
                <Text style={styles.plantType}>{plant.type}</Text>
                <Text style={styles.lastWateredText}>Last watered: {timeText}</Text>
              </View>
              <View style={styles.analyticsButtonContainer}>
                <Text style={styles.analyticsButtonText}>Analytics</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };
  
  // Function to render system health
  const renderSystemHealth = () => {
    // Format the last sync time
    const syncDate = new Date(SYSTEM_HEALTH.lastSync);
    const formattedSync = syncDate.toLocaleString('en-US', {
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    return (
      <View style={styles.systemHealthCard}>
        <Text style={styles.systemHealthTitle}>System Status</Text>
        
        <View style={styles.systemHealthRow}>
          <View style={styles.systemHealthItem}>
            <Text style={styles.systemHealthLabel}>Battery</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${SYSTEM_HEALTH.batteryLevel}%`,
                    backgroundColor: SYSTEM_HEALTH.batteryLevel > 50 
                      ? COLORS.success 
                      : SYSTEM_HEALTH.batteryLevel > 20
                        ? COLORS.warning
                        : COLORS.error
                  }
                ]} 
              />
            </View>
            <Text style={styles.systemHealthValue}>{SYSTEM_HEALTH.batteryLevel}%</Text>
          </View>
          
          <View style={styles.systemHealthItem}>
            <Text style={styles.systemHealthLabel}>Water Tank</Text>
            <View style={styles.progressBarContainer}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    width: `${SYSTEM_HEALTH.reservoirLevel}%`,
                    backgroundColor: SYSTEM_HEALTH.reservoirLevel > 30 
                      ? COLORS.success 
                      : SYSTEM_HEALTH.reservoirLevel > 10
                        ? COLORS.warning
                        : COLORS.error
                  }
                ]} 
              />
            </View>
            <Text style={styles.systemHealthValue}>{SYSTEM_HEALTH.reservoirLevel}%</Text>
          </View>
        </View>
        
        <View style={styles.systemHealthRow}>
          <View style={styles.systemHealthItem}>
            <Text style={styles.systemHealthLabel}>WiFi Signal</Text>
            <Text style={styles.systemHealthValueOnly}>{SYSTEM_HEALTH.wifiSignal}</Text>
          </View>
          
          <View style={styles.systemHealthItem}>
            <Text style={styles.systemHealthLabel}>Last Sync</Text>
            <Text style={styles.systemHealthValueOnly}>{formattedSync}</Text>
          </View>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>Plants Analytics</Text>
      </View>
      
      {/* Time Period Selector */}
      <View style={styles.periodSelectorContainer}>
        <TouchableOpacity
          style={[
            styles.periodOption,
            timeRange === '24h' && styles.selectedPeriodOption
          ]}
          onPress={() => handleTimeRangeChange('24h')}
        >
          <Text 
            style={[
              styles.periodOptionText,
              timeRange === '24h' && styles.selectedPeriodText
            ]}
          >
            24 Hours
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.periodOption,
            timeRange === '7d' && styles.selectedPeriodOption
          ]}
          onPress={() => handleTimeRangeChange('7d')}
        >
          <Text 
            style={[
              styles.periodOptionText,
              timeRange === '7d' && styles.selectedPeriodText
            ]}
          >
            7 Days
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.periodOption,
            timeRange === '30d' && styles.selectedPeriodOption
          ]}
          onPress={() => handleTimeRangeChange('30d')}
        >
          <Text 
            style={[
              styles.periodOptionText,
              timeRange === '30d' && styles.selectedPeriodText
            ]}
          >
            30 Days
          </Text>
        </TouchableOpacity>
      </View>
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading analytics data...</Text>
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
            {/* Summary Stats */}
            <View style={styles.summaryContainer}>
              <Text style={styles.sectionTitle}>Weekly Summary</Text>
              
              <View style={styles.summaryCards}>
                <View style={styles.summaryCard}>
                  <View style={styles.summaryIconContainer}>
                    <Text style={styles.summaryIcon}>💧</Text>
                  </View>
                  <Text style={styles.summaryValue}>{WEEKLY_SUMMARY.totalWaterUsed} ml</Text>
                  <Text style={styles.summaryLabel}>Water Used</Text>
                </View>
                
                <View style={styles.summaryCard}>
                  <View style={styles.summaryIconContainer}>
                    <Text style={styles.summaryIcon}>🔄</Text>
                  </View>
                  <Text style={styles.summaryValue}>{WEEKLY_SUMMARY.wateringEvents}</Text>
                  <Text style={styles.summaryLabel}>Waterings</Text>
                </View>
                
                <View style={styles.summaryCard}>
                  <View style={styles.summaryIconContainer}>
                    <Text style={styles.summaryIcon}>📈</Text>
                  </View>
                  <Text style={styles.summaryValue}>+{WEEKLY_SUMMARY.avgMoistureIncrease}%</Text>
                  <Text style={styles.summaryLabel}>Avg. Gain</Text>
                </View>
              </View>
            </View>
            
            {/* Water Usage Chart */}
            <View style={styles.waterUsageSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Water Usage</Text>
                <TouchableOpacity 
                  style={styles.helpButton}
                  onPress={() => alert('This chart shows water consumption for all your plants combined.')}
                >
                  <Text style={styles.helpButtonText}>?</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.sectionSubtitle}>
                Total water consumption for {timeRange === '24h' ? 'last 24 hours' : timeRange === '7d' ? 'last 7 days' : 'last 30 days'}
              </Text>
              
              {renderWaterUsageChart()}
            </View>
            
            {/* Upcoming Waterings */}
            <View style={styles.predictionsSection}>
              <Text style={styles.sectionTitle}>Upcoming Waterings</Text>
              <Text style={styles.sectionSubtitle}>
                Based on soil moisture depletion trends
              </Text>
              
              {renderWateringPredictions()}
            </View>
            
            {/* All Plants */}
            <View style={styles.plantsSection}>
              <Text style={styles.sectionTitle}>All Plants</Text>
              <Text style={styles.sectionSubtitle}>
                Select a plant to view detailed analytics
              </Text>
              
              {renderPlantsList()}
            </View>
            
            {/* System Health */}
            <View style={styles.systemSection}>
              <Text style={styles.sectionTitle}>System Health</Text>
              
              {renderSystemHealth()}
            </View>
            
            {/* Report Button */}
            <View style={styles.reportSection}>
              <TouchableOpacity 
                style={styles.reportButton}
                onPress={() => alert('Report generation will be implemented in a future update.')}
              >
                <Text style={styles.reportButtonText}>Generate Report</Text>
              </TouchableOpacity>
              <Text style={styles.reportHint}>
                Generate a comprehensive report of your watering history and patterns
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
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
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
  summaryContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
    margin: 5,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryIcon: {
    fontSize: 20,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  helpButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.gray,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 15,
  },
  waterUsageSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  chartContainer: {
    height: 250,
    flexDirection: 'row',
    marginBottom: 30,
  },
  chartYAxis: {
    width: 50,
    height: '100%',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  chartYLabel: {
    fontSize: 10,
    color: COLORS.gray,
    textAlign: 'right',
    paddingRight: 5,
  },
  barChartContainer: {
    flexDirection: 'row',
    height: '100%',
    alignItems: 'flex-end',
    paddingVertical: 10,
  },
  barColumn: {
    alignItems: 'center',
    marginHorizontal: 10,
  },
  barValue: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: '600',
    marginBottom: 5,
  },
  barWrapper: {
    width: 20,
    height: 180,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderTopLeftRadius: 3,
    borderTopRightRadius: 3,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 5,
  },
  predictionsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  predictionsContainer: {
    marginBottom: 15,
  },
  predictionItem: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  predictionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  predictionPlant: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  confidenceBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  highConfidence: {
    backgroundColor: COLORS.success + '30',
  },
  mediumConfidence: {
    backgroundColor: COLORS.warning + '30',
  },
  lowConfidence: {
    backgroundColor: COLORS.error + '30',
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  predictionDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  predictionTimeContainer: {
    flex: 1,
  },
  predictionDay: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 2,
  },
  predictionTime: {
    fontSize: 13,
    color: COLORS.gray,
  },
  viewDetailsButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  viewDetailsText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  plantsSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  plantListContainer: {
    marginVertical: 10,
  },
  plantCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  plantInfo: {
    flex: 1,
  },
  plantNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  plantType: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  lastWateredText: {
    fontSize: 12,
    color: COLORS.gray,
  },
  analyticsButtonContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  analyticsButtonText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  systemSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  systemHealthCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  systemHealthTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  systemHealthRow: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  systemHealthItem: {
    flex: 1,
    marginHorizontal: 5,
  },
  systemHealthLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 5,
  },
  systemHealthValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'right',
  },
  systemHealthValueOnly: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  reportSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  reportButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  reportButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  reportHint: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
});

export default PlantAnalyticsDashboard;