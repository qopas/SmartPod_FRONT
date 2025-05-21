// src/screens/home/PlantDetailScreen.tsx
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  ScrollView,
  Image,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 290;
const HEADER_MIN_HEIGHT = 90;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;
const IMAGE_SIZE = 180;

const PlantDetailScreen = ({ route, navigation }: any) => {
  const { plant } = route.params;
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // Animation values for different components
  const imageOpacity = useRef(new Animated.Value(0)).current;
  const imageScale = useRef(new Animated.Value(0.8)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(50)).current;
  
  // Animations for scroll-based header
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });
  
  const imageOpacityFromScroll = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });
  
  const imageTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [0, -50],
    extrapolate: 'clamp',
  });
  
  const imageScale2 = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  
  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [20, 0],
    extrapolate: 'clamp',
  });
  
  const titleScale = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [1.2, 1],
    extrapolate: 'clamp',
  });

  const headerBorderRadius = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [40, 0],
    extrapolate: 'clamp',
  });
  
  const isLowWater = plant.reservoirLevel <= 15;

  // Entry animations
  useEffect(() => {
    Animated.parallel([
      Animated.timing(imageOpacity, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(imageScale, {
        toValue: 1,
        tension: 20,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 700,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const renderMetricItem = (label: string, value: string, additionalStyle = {}) => (
    <View style={[styles.metricItem, additionalStyle]}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );

  const getWaterTankColor = (level: number) => {
    if (level < 15) return COLORS.error;
    if (level < 40) return COLORS.warning;
    return COLORS.success;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return COLORS.success;
      case 'needs_water':
        return COLORS.warning;
      case 'needs_attention':
        return COLORS.error;
      default:
        return COLORS.success;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'Healthy';
      case 'needs_water':
        return 'Needs Water';
      case 'needs_attention':
        return 'Needs Attention';
      default:
        return 'Healthy';
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent={true} />
      
      {/* Curved Header Background */}
      <Animated.View 
        style={[
          styles.headerBackground, 
          { 
            height: headerHeight,
            borderBottomLeftRadius: headerBorderRadius,
            borderBottomRightRadius: headerBorderRadius,
          }
        ]}
      />
      
      {/* Back Button and Title */}
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={styles.backIcon}>←</Text>
          <Text style={styles.backText}>My plants</Text>
        </TouchableOpacity>
        
        <Animated.View 
          style={[
            styles.titleContainer,
            {
              transform: [
                { translateY: titleTranslateY },
                { scale: titleScale }
              ],
              opacity: scrollY.interpolate({
                inputRange: [0, HEADER_SCROLL_DISTANCE / 2],
                outputRange: [1, 0],
                extrapolate: 'clamp',
              }),
            }
          ]}
        >
          <Text style={styles.headerTitle}>{plant.name}</Text>
          <Text style={styles.headerSubtitle}>{plant.age}</Text>
        </Animated.View>
        
        {/* Title that appears when scrolling */}
        <Animated.View 
          style={[
            styles.scrolledTitleContainer,
            {
              opacity: scrollY.interpolate({
                inputRange: [HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
                outputRange: [0, 1],
                extrapolate: 'clamp',
              }),
            }
          ]}
        >
          <Text style={styles.scrolledTitle}>{plant.name}</Text>
        </Animated.View>
      </SafeAreaView>
      
      {/* Plant Image */}
      <Animated.View 
        style={[
          styles.headerImageContainer,
          {
            opacity: imageOpacityFromScroll,
            transform: [
              { translateY: imageTranslateY },
              { scale: imageScale2 }
            ],
          }
        ]}
      >
        {plant.image ? (
          <Animated.Image 
            source={plant.image}
            style={[
              styles.headerImage,
              {
                opacity: imageOpacity,
                transform: [{ scale: imageScale }],
              }
            ]}
            resizeMode="cover"
          />
        ) : (
          <Animated.View style={[
            styles.plantImagePlaceholder,
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            }
          ]} />
        )}
        
        {/* Status Badge on Image */}
        <Animated.View 
          style={[
            styles.imageStatusBadge,
            { backgroundColor: getStatusColor(plant.status) },
            {
              opacity: imageOpacity,
              transform: [{ scale: imageScale }],
            }
          ]}
        >
          <Text style={styles.imageStatusText}>{getStatusText(plant.status)}</Text>
        </Animated.View>
      </Animated.View>
      
      {/* Main Scrollable Content */}
      <Animated.ScrollView
        contentContainerStyle={styles.scrollContainer}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        style={{
          opacity: contentOpacity,
          transform: [{ translateY: contentTranslateY }],
        }}
      >
        {/* Plant Metrics Section */}
        <View style={styles.metricsSection}>
          <View style={styles.metricsRow}>
            <View style={[styles.metricCard, styles.elevatedCard]}>
              <View style={styles.metricIconContainer}>
                <Text style={styles.metricIcon}>💧</Text>
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricTitle}>Moisture</Text>
                <View style={styles.metricGauge}>
                  <View style={styles.gaugeBackground}>
                    <View 
                      style={[
                        styles.gaugeFill, 
                        { 
                          width: `${plant.moistureLevel}%`,
                          backgroundColor: plant.moistureLevel < 30 ? COLORS.error : 
                                        plant.moistureLevel < 60 ? COLORS.warning : 
                                        COLORS.secondary
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.gaugeValue}>{plant.moistureLevel}%</Text>
                </View>
              </View>
            </View>
            
            <View style={[styles.metricCard, styles.elevatedCard]}>
              <View style={styles.metricIconContainer}>
                <Text style={styles.metricIcon}>🚰</Text>
              </View>
              <View style={styles.metricContent}>
                <Text style={styles.metricTitle}>Water Tank</Text>
                <View style={styles.metricGauge}>
                  <View style={styles.gaugeBackground}>
                    <View 
                      style={[
                        styles.gaugeFill, 
                        { 
                          width: `${plant.reservoirLevel}%`,
                          backgroundColor: getWaterTankColor(plant.reservoirLevel)
                        }
                      ]} 
                    />
                  </View>
                  <Text style={styles.gaugeValue}>{plant.reservoirLevel}%</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
        
        {/* Basic Info Section */}
        <View style={[styles.infoSection, styles.elevatedCard]}>
          <Text style={styles.sectionTitle}>Plant Info</Text>
          
          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>🌿</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>{plant.type}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>📍</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue}>{plant.location}</Text>
              </View>
            </View>
            
            <View style={styles.detailItem}>
              <View style={styles.detailIconContainer}>
                <Text style={styles.detailIcon}>💦</Text>
              </View>
              <View>
                <Text style={styles.detailLabel}>Last Watered</Text>
                <Text style={styles.detailValue}>{new Date(plant.lastWatered).toLocaleDateString()}</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Water Alert Section */}
        {isLowWater && (
          <View style={styles.alertSection}>
            <View style={[styles.alertContent, styles.elevatedCard]}>
              <View style={styles.alertHeader}>
                <View style={styles.alertIconContainer}>
                  <Text style={styles.alertIcon}>⚠️</Text>
                </View>
                <Text style={styles.alertTitle}>Water Tank Alert</Text>
              </View>
              <Text style={styles.alertMessage}>
                The water tank level is critically low. Please refill it soon to maintain plant health.
              </Text>
              <TouchableOpacity 
                style={styles.alertActionButton}
                onPress={() => alert('Reminder set for tank refill')}
              >
                <Text style={styles.alertActionText}>Remind Me Later</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {/* Historical Data Section */}
        <View style={[styles.chartsSection, styles.elevatedCard]}>
          <View style={styles.sectionTitleRow}>
            <Text style={styles.sectionTitle}>Historical Data</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.chartContainer}>
            <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Moisture Levels</Text>
              <View style={styles.chartPeriodSelector}>
                <Text style={[styles.periodOption, styles.periodActive]}>7d</Text>
                <Text style={styles.periodOption}>30d</Text>
                <Text style={styles.periodOption}>All</Text>
              </View>
            </View>
            <View style={styles.chartPlaceholder}>
              <Text style={styles.chartText}>Chart will appear here</Text>
            </View>
          </View>
        </View>
        
        {/* Control Section */}
        <View style={styles.controlSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => alert('Manual watering initiated')}
          >
            <Text style={styles.actionButtonText}>Water Now</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => alert('Adjusting settings')}
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Settings</Text>
          </TouchableOpacity>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f8fa',
  },
  safeArea: {
    width: '100%',
    position: 'absolute',
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    zIndex: 100,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    zIndex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    zIndex: 101,
  },
  backIcon: {
    fontSize: 24,
    color: COLORS.white,
    marginRight: 8,
  },
  backText: {
    fontSize: 16,
    color: COLORS.white,
    fontWeight: '500',
  },
  titleContainer: {
    position: 'absolute',
    top: 80,
    left: 25,
    right: 25,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: COLORS.white,
    fontSize: 16,
    opacity: 0.9,
  },
  scrolledTitleContainer: {
    position: 'absolute',
    top: 16,
    left: 65,
    right: 25,
    alignItems: 'center',
  },
  scrolledTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerImageContainer: {
    position: 'absolute',
    alignSelf: 'center',
    top: HEADER_MAX_HEIGHT - IMAGE_SIZE/2,
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    zIndex: 10,
  },
  headerImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE/2,
    borderWidth: 4,
    borderColor: COLORS.white,
    backgroundColor: COLORS.white,
  },
  plantImagePlaceholder: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: IMAGE_SIZE/2,
    backgroundColor: '#e0e0e0',
    borderWidth: 4,
    borderColor: COLORS.white,
  },
  imageStatusBadge: {
    position: 'absolute',
    bottom: 10,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: 'white',
  },
  imageStatusText: {
    color: 'white',
    fontSize: 11,
    fontWeight: 'bold',
  },
  scrollContainer: {
    paddingTop: HEADER_MAX_HEIGHT + IMAGE_SIZE/1.5,
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  elevatedCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  metricsSection: {
    marginTop: 45,
    marginBottom: 20,
  },
  metricsRow: {
    marginBottom: 8,
  },
  metricCard: {
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f0f7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  metricIcon: {
    fontSize: 20,
  },
  metricContent: {
    flex: 1,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  metricGauge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gaugeBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#eaeaea',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 12,
  },
  gaugeFill: {
    height: '100%',
    borderRadius: 4,
  },
  gaugeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    minWidth: 40,
    textAlign: 'right',
  },
  infoSection: {
    padding: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllButton: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  detailsGrid: {
    flexDirection: 'column',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailIcon: {
    fontSize: 18,
  },
  detailLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
  alertSection: {
    marginBottom: 20,
  },
  alertContent: {
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
    backgroundColor: '#fff9f0',
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertIconContainer: {
    marginRight: 12,
  },
  alertIcon: {
    fontSize: 22,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  alertMessage: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 16,
  },
  alertActionButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  alertActionText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  chartsSection: {
    padding: 16,
    marginBottom: 20,
  },
  chartContainer: {
    marginTop: 4,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  chartPeriodSelector: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 2,
  },
  periodOption: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 12,
    color: COLORS.gray,
  },
  periodActive: {
    backgroundColor: COLORS.white,
    color: COLORS.primary,
    fontWeight: '600',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  chartPlaceholder: {
    height: 180,
    backgroundColor: '#f8f8f8',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  controlSection: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.black,
    shadowOpacity: 0.15,
  },
  secondaryButtonText: {
    color: COLORS.primary,
  },
  metricItem: {
    marginRight: 40,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 5,
  },
  metricLabel: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
  },
});

export default PlantDetailScreen;