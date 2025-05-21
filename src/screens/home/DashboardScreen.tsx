// src/screens/home/DashboardScreen.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
  RefreshControl,
  Image,
  Animated,
  Dimensions,
  Platform,
  FlatList,
} from 'react-native';
import { COLORS } from '../../constants/colors';

const { width, height } = Dimensions.get('window');
// Adjusted sizes for a centered carousel with visible side items
const ITEM_WIDTH = width * 0.65;  // Main item takes 65% of screen width
const ITEM_HEIGHT = ITEM_WIDTH * 1.25;
const SPACING = 10;
const SNAP_INTERVAL = ITEM_WIDTH + SPACING * 2;

// Mock data for plant pots
const MOCK_PLANT_POTS = [
  {
    id: '1',
    name: 'Snake Plant',
    type: 'Sansevieria',
    moistureLevel: 68, // percentage
    reservoirLevel: 75, // percentage
    lastWatered: '2025-04-27T08:30:00',
    location: 'INDOOR',
    status: 'healthy', // can be: healthy, needs_water, needs_attention
    age: '12 weeks',
    image: require('../../assets/images/plants/snake_plant.png'),
  },
  {
    id: '2',
    name: 'Peace Lily',
    type: 'Spathiphyllum',
    moistureLevel: 32,
    reservoirLevel: 10,
    lastWatered: '2025-04-26T10:15:00',
    location: 'INDOOR',
    status: 'needs_water',
    age: '26 weeks',
    image: require('../../assets/images/plants/peace_lily.png'),
  },
  {
    id: '3',
    name: 'Money Plant',
    type: 'Epipremnum aureum',
    moistureLevel: 25,
    reservoirLevel: 35,
    lastWatered: '2025-04-25T16:45:00',
    location: 'INDOOR',
    status: 'needs_attention',
    age: '8 weeks',
    image: require('../../assets/images/plants/money_plant.png'),
  },
];

// Interface for Carousel Item Props
interface CarouselItemProps {
  item: typeof MOCK_PLANT_POTS[0];
  index: number;
  scrollX: Animated.Value;
  onPress: () => void;
  onAnalyticsPress: () => void;
}

// Carousel Item Component
const CarouselItem: React.FC<CarouselItemProps> = ({ 
  item, 
  index, 
  scrollX, 
  onPress,
  onAnalyticsPress
}) => {
  // Position of current item
  const position = Animated.subtract(index * SNAP_INTERVAL, scrollX);
  
  // Calculating animations based on position (using only native compatible transforms)
  const scale = position.interpolate({
    inputRange: [-SNAP_INTERVAL, 0, SNAP_INTERVAL],
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });
  
  const translateY = position.interpolate({
    inputRange: [-SNAP_INTERVAL, 0, SNAP_INTERVAL],
    outputRange: [30, 0, 30],
    extrapolate: 'clamp',
  });
  
  const opacity = position.interpolate({
    inputRange: [-SNAP_INTERVAL, 0, SNAP_INTERVAL],
    outputRange: [0.7, 1, 0.7],
    extrapolate: 'clamp',
  });
  
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
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View
        style={[
          styles.carouselItem,
          {
            opacity,
            transform: [
              { scale },
              { translateY },
            ],
          },
        ]}
      >
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image
              source={item.image}
              style={styles.plantImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.imagePlaceholder} />
          )}
          
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          
          {/* Analytics Button */}
          <TouchableOpacity
            style={styles.analyticsButton}
            onPress={onAnalyticsPress}
          >
            <Text style={styles.analyticsButtonText}>📊 Analytics</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.plantInfo}>
          <Text style={styles.plantName}>{item.name}</Text>
          <Text style={styles.plantType}>{item.type}</Text>
          <Text style={styles.plantLocation}>{item.location}</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Main Dashboard Screen
const DashboardScreen = ({ navigation }: any) => {
  const [refreshing, setRefreshing] = useState(false);
  const [plants, setPlants] = useState(MOCK_PLANT_POTS);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Header animations
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });
  
  const headerHeight = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [80, 60],
    extrapolate: 'clamp',
  });
  
  const titleScale = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.8],
    extrapolate: 'clamp',
  });
  
  // Handle carousel item changes
  const onViewableItemsChanged = React.useRef(({ viewableItems }) => {
    if (viewableItems[0]?.index !== undefined) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;
  
  const viewabilityConfig = React.useRef({
    itemVisiblePercentThreshold: 50
  }).current;
  
  // Refresh function
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);
  
  // Navigation to plant detail screen
  const handlePlantPress = (plant) => {
    navigation.navigate('PlantDetail', { plant });
  };
  
  // Navigation to device setup
  const handleAddNewDevice = () => {
    navigation.navigate('DeviceSetup');
  };
  
  // Navigation to analytics
  const navigateToAnalytics = (plant) => {
    navigation.navigate('Analytics', {
      screen: 'HistoricalData',
      params: { plant: plant }
    });
  };

  // Navigation to analytics dashboard
  const navigateToAnalyticsDashboard = () => {
    navigation.navigate('Analytics', {
      screen: 'AnalyticsDashboard'
    });
  };
  
  // Render indicator dots for the carousel
  const renderIndicators = () => {
    return (
      <View style={styles.indicatorsContainer}>
        {plants.map((_, index) => (
          <View
            key={index}
            style={[
              styles.indicator,
              { backgroundColor: index === activeIndex ? COLORS.primary : COLORS.lightGray }
            ]}
          />
        ))}
      </View>
    );
  };
  
  // Small Plant Card Component
  const renderSmallPlantCard = (plant, index) => {
    return (
      <TouchableOpacity
        key={plant.id}
        style={styles.smallPlantCard}
        onPress={() => handlePlantPress(plant)}
      >
        <View style={styles.smallPlantImageContainer}>
          {plant.image ? (
            <Image
              source={plant.image}
              style={styles.smallPlantImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.smallPlantImagePlaceholder} />
          )}
          <View 
            style={[
              styles.smallStatusIndicator, 
              { 
                backgroundColor: plant.status === 'healthy' 
                  ? COLORS.success 
                  : plant.status === 'needs_water' 
                    ? COLORS.warning 
                    : COLORS.error 
              }
            ]}
          >
            <Text style={styles.smallStatusIcon}>
              {plant.status === 'healthy' ? '✓' : '⚠️'}
            </Text>
          </View>
          
          {/* Small Analytics Button */}
          <TouchableOpacity
            style={styles.smallAnalyticsButton}
            onPress={() => navigateToAnalytics(plant)}
          >
            <Text style={styles.smallAnalyticsButtonText}>📊</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.smallPlantName}>{plant.name}</Text>
        <Text style={styles.smallPlantLocation}>{plant.location}</Text>
      </TouchableOpacity>
    );
  };
  
  // Show progress bar for moisture or reservoirLevel
  const renderProgressBar = (value, thresholds) => {
    let barColor = COLORS.success;
    if (value < thresholds.low) {
      barColor = COLORS.error;
    } else if (value < thresholds.medium) {
      barColor = COLORS.warning;
    }
    
    return (
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBg}>
          <View 
            style={[
              styles.progressBarFill,
              { width: `${value}%`, backgroundColor: barColor }
            ]} 
          />
        </View>
        <Text style={styles.progressBarText}>{value}%</Text>
      </View>
    );
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent={Platform.OS === 'android'} />
      
      {/* Animated Header */}
      <Animated.View 
        style={[
          styles.header,
          { 
            opacity: headerOpacity,
            height: headerHeight,
          }
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity 
            style={styles.menuButton}
            onPress={() => alert('Menu will open')}
          >
            <Text style={styles.menuIcon}>≡</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🌱</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => alert('Profile will open')}
          >
            <Text style={styles.profileIcon}>👤</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        <View style={styles.headerRow}>
          <Animated.Text 
            style={[
              styles.pageTitle,
              { transform: [{ scale: titleScale }] }
            ]}
          >
            My plants
          </Animated.Text>
          
          {/* All Analytics Button */}
          <TouchableOpacity
            style={styles.allAnalyticsButton}
            onPress={navigateToAnalyticsDashboard}
          >
            <Text style={styles.allAnalyticsButtonText}>📊 All Analytics</Text>
          </TouchableOpacity>
        </View>
        
        {/* Centered Carousel */}
        <View style={styles.carouselContainer}>
          <Animated.FlatList
            ref={flatListRef}
            data={plants}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselList}
            snapToInterval={SNAP_INTERVAL}
            snapToAlignment="center"
            decelerationRate="fast"
            bounces={true}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: true }
            )}
            scrollEventThrottle={16}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            initialScrollIndex={0}
            getItemLayout={(data, index) => ({
              length: SNAP_INTERVAL,
              offset: SNAP_INTERVAL * index,
              index,
            })}
            renderItem={({ item, index }) => (
              <View style={styles.carouselItemContainer}>
                <CarouselItem
                  item={item}
                  index={index}
                  scrollX={scrollX}
                  onPress={() => handlePlantPress(item)}
                  onAnalyticsPress={() => navigateToAnalytics(item)}
                />
              </View>
            )}
          />
          
          {/* Carousel Indicators */}
          {renderIndicators()}
        </View>
        
        {/* Plant Stats */}
        <View style={styles.statsContainer}>
          {activeIndex < plants.length && (
            <>
              <View style={styles.statsHeader}>
                <Text style={styles.statsTitle}>Plant Health</Text>
              </View>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIcon}>💧</Text>
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>Moisture</Text>
                    {renderProgressBar(plants[activeIndex].moistureLevel, { low: 30, medium: 60 })}
                  </View>
                </View>
                
                <View style={styles.statItem}>
                  <View style={styles.statIconContainer}>
                    <Text style={styles.statIcon}>🚰</Text>
                  </View>
                  <View style={styles.statContent}>
                    <Text style={styles.statLabel}>Water Tank</Text>
                    {renderProgressBar(plants[activeIndex].reservoirLevel, { low: 15, medium: 40 })}
                  </View>
                </View>
              </View>
            </>
          )}
        </View>
        
        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{plants.length}</Text>
              <Text style={styles.summaryLabel}>Plants</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {plants.filter(p => p.status === 'needs_water' || p.status === 'needs_attention').length}
              </Text>
              <Text style={styles.summaryLabel}>Need Attention</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>
                {plants.filter(p => p.reservoirLevel < 15).length}
              </Text>
              <Text style={styles.summaryLabel}>Low Water</Text>
            </View>
          </View>
        </View>
        
        {/* All Plants Grid */}
        <View style={styles.allPlantsSection}>
          <Text style={styles.sectionTitle}>All Plants</Text>
          <View style={styles.plantsGrid}>
            {plants.map((plant, index) => renderSmallPlantCard(plant, index))}
          </View>
        </View>
        
        {/* Add Plant Button */}
        <View style={styles.addPlantSection}>
          <Text style={styles.addPlantTitle}>Add a new plant</Text>
          <TouchableOpacity 
            style={styles.addPlantButton}
            onPress={handleAddNewDevice}
          >
            <Text style={styles.addPlantIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
  },
  menuButton: {
    padding: 5,
  },
  menuIcon: {
    fontSize: 24,
    color: COLORS.text,
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logoIcon: {
    fontSize: 24,
    color: COLORS.primary,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileIcon: {
    fontSize: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 20,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  allAnalyticsButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  allAnalyticsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  // Carousel Styles
  carouselContainer: {
    paddingVertical: 20,
  },
  carouselList: {
    paddingHorizontal: (width - ITEM_WIDTH) / 2 - SPACING,
  },
  carouselItemContainer: {
    width: ITEM_WIDTH,
    marginHorizontal: SPACING,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselItem: {
    width: ITEM_WIDTH,
    height: ITEM_HEIGHT,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 7,
    overflow: 'hidden',
  },
  imageContainer: {
    width: '100%',
    height: '70%',
    position: 'relative',
  },
  plantImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  analyticsButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  analyticsButtonText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  plantInfo: {
    width: '100%',
    height: '30%',
    padding: 15,
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  plantType: {
    fontSize: 14,
    color: COLORS.gray,
    fontStyle: 'italic',
    marginBottom: 5,
  },
  plantLocation: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  indicator: {
    height: 8,
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: COLORS.lightGray,
  },
  // Stats Styles
  statsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    margin: 20,
    marginTop: 10,
    padding: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  statsHeader: {
    marginBottom: 15,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  statsRow: {
    marginBottom: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  statIcon: {
    fontSize: 20,
  },
  statContent: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 5,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 10,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressBarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    width: 35,
    textAlign: 'right',
  },
  // Summary Section
  summarySection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  summaryNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  // All Plants Section
  allPlantsSection: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  plantsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  smallPlantCard: {
    width: '30%',
    marginBottom: 20,
    alignItems: 'center',
  },
  smallPlantImageContainer: {
    width: width * 0.24,
    height: width * 0.3,
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  smallPlantImage: {
    width: '100%',
    height: '100%',
  },
  smallPlantImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: COLORS.lightGray,
  },
  smallStatusIndicator: {
    position: 'absolute',
    top: 5,
    left: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  smallStatusIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  smallAnalyticsButton: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  smallAnalyticsButtonText: {
    fontSize: 12,
  },
  smallPlantName: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
    textAlign: 'center',
  },
  smallPlantLocation: {
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },
  // Add Plant Section
  addPlantSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  addPlantTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  addPlantButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addPlantIcon: {
    fontSize: 32,
    color: '#FFFFFF',
  },
});

export default DashboardScreen;