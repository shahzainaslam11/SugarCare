import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../../../components'; // Adjust the import path as needed
import {useNavigation} from '@react-navigation/native';
import {appImages, colors, family, size, WP, HP} from '../../../utilities'; // Adjust the import path as needed

const CommunityInsight = () => {
  const navigation = useNavigation();

  // Function to navigate to Insight Details screen with insight data
  const navigateToInsightDetails = insight => {
    navigation.navigate('InsightDetails', {
      title: insight.title,
      description: insight.description || 'No description available',
      image: insight.image,
    });
  };

  const insights = {
    featured: {
      title: '5 Foods That Help Stabilize Blood Sugar',
      description:
        'Based on 2,000 SugarCare users, oats are one of the best breakfast choices...',
      image: appImages.p1,
    },
    explore1: {
      title: 'How Evening Walks Improve Sugar Control',
      description:
        'Learn how a simple evening walk can significantly impact your blood sugar levels.',
      image: appImages.p2,
    },
    explore2: {
      title: 'How Drinking Water helps in managing your blood sugar?',
      description:
        'Discover the benefits of hydration for blood sugar management.',
      image: appImages.p11,
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Community Insights" onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            placeholderTextColor={colors.g9}
          />
        </View>

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => navigateToInsightDetails(insights.featured)}>
            <Image
              source={insights.featured.image}
              style={styles.featuredImage}
              resizeMode="cover"
            />
            <View style={styles.featuredText}>
              <Text style={styles.featuredTitle}>
                {insights.featured.title}
              </Text>
              <Text style={styles.featuredDescription}>
                {insights.featured.description}
                <TouchableOpacity>
                  <Text style={styles.readMore}> Read More</Text>
                </TouchableOpacity>
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Explore Latest Section */}
        <View style={styles.exploreSection}>
          <Text style={styles.sectionTitle}>Explore Latest</Text>
          <TouchableOpacity
            style={styles.exploreCard}
            onPress={() => navigateToInsightDetails(insights.explore1)}>
            <Image
              source={insights.explore1.image}
              style={styles.exploreImage}
              resizeMode="cover"
            />
            <View style={styles.exploreText}>
              <Text style={styles.exploreTitle}>{insights.explore1.title}</Text>
              <Text style={styles.exploreTime}>5 min read</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.exploreCard}
            onPress={() => navigateToInsightDetails(insights.explore2)}>
            <Image
              source={insights.explore2.image}
              style={styles.exploreImage}
              resizeMode="cover"
            />
            <View style={styles.exploreText}>
              <Text style={styles.exploreTitle}>{insights.explore2.title}</Text>
              <Text style={styles.exploreTime}>2 min read</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  searchContainer: {
    padding: WP(4),
    backgroundColor: colors.white,
  },
  searchInput: {
    height: 40,
    borderWidth: 1,
    borderColor: colors.g15,
    borderRadius: 8,
    paddingHorizontal: WP(3),
    fontSize: size.normal,
    fontFamily: family.inter_regular,
    color: colors.b1,
    backgroundColor: colors.white,
  },
  featuredSection: {
    padding: WP(4),
    backgroundColor: colors.white,
    marginTop: HP(1),
  },
  sectionTitle: {
    fontSize: size.large,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_medium,
    marginBottom: HP(1),
  },
  featuredCard: {
    backgroundColor: colors.g15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featuredImage: {
    width: '100%',
    height: 200,
  },
  featuredText: {
    padding: WP(3),
  },
  featuredTitle: {
    fontSize: size.xlarge,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_bold,
    marginBottom: HP(0.5),
  },
  featuredDescription: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
  },
  readMore: {
    color: colors.p1,
    fontFamily: family.inter_medium,
  },
  exploreSection: {
    padding: WP(4),
    backgroundColor: colors.white,
  },
  exploreCard: {
    flexDirection: 'row',
    backgroundColor: colors.g15,
    borderRadius: 12,
    marginBottom: HP(1),
    padding: WP(2),
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  exploreImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: WP(2),
  },
  exploreText: {
    flex: 1,
  },
  exploreTitle: {
    fontSize: size.normal,
    color: colors.b1,
    fontFamily: family.inter_medium,
    marginBottom: HP(0.5),
  },
  exploreTime: {
    fontSize: size.small,
    color: colors.g9,
    fontFamily: family.inter_regular,
  },
});

export default CommunityInsight;
