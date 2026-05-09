import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {Header, SmallLoader} from '../../../components';
import {colors, appImages, appIcons} from '../../../utilities';
import {fetchCommunityInsights} from '../../../redux/slices/communityInsightsSlice';
import styles from './styles';

const CommunityInsight = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {accessToken, user} = useSelector(state => state.auth);
  const {items, loading} = useSelector(state => state.communityInsights);
  const [searchQuery, setSearchQuery] = useState('');
  const safeItems = Array.isArray(items) ? items : [];

  useEffect(() => {
    if (accessToken && user?.id) {
      dispatch(fetchCommunityInsights({token: accessToken, user_id: user.id}));
    }
  }, [dispatch, accessToken, user?.id]);

  const navigateToInsightDetails = insight => {
    navigation.navigate('InsightDetails', {
      insight,
    });
  };

  const normalizeInsight = insight => ({
    id: insight?.id || `${insight?.title || 'insight'}-${Math.random()}`,
    title: typeof insight?.title === 'string' ? insight.title : 'Untitled Insight',
    description:
      typeof insight?.description === 'string' && insight.description.trim()
        ? insight.description
        : 'No description available',
    image: insight?.image || null,
    read_time: insight?.read_time,
    author_name: insight?.author_name || '',
    created_at: insight?.created_at || '',
    featured: Boolean(insight?.featured),
  });

  const getImageSource = image => {
    if (!image) return appImages.p1;
    if (typeof image === 'string') return {uri: image};
    return image;
  };

  // Filtered by search query
  const filteredItems = safeItems
    .map(normalizeInsight)
    .filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()));

  // Featured is the first item
  const featuredInsight = filteredItems[0] || {
    title: 'No Featured Insight',
    description: 'No description available',
    image: appImages.p1,
  };

  // Explore Latest is the rest
  const exploreInsights = filteredItems.slice(1);

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Community Insights" onPress={() => navigation.goBack()} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search insights..."
              placeholderTextColor={colors.g9}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}>
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {loading && <SmallLoader />}

        {/* Featured Section */}
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Featured</Text>
            <View style={styles.featuredBadge}>
              <Text style={styles.featuredBadgeText}>TOP STORY</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.featuredCard}
            onPress={() => navigateToInsightDetails(featuredInsight)}
            activeOpacity={0.9}>
            <View style={styles.featuredImageContainer}>
              <Image
                source={getImageSource(featuredInsight.image)}
                style={styles.featuredImage}
                resizeMode="cover"
              />
              <View style={styles.imageOverlay} />
            </View>
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle} numberOfLines={2}>
                {featuredInsight.title}
              </Text>
              <Text style={styles.featuredDescription} numberOfLines={2}>
                {featuredInsight.description}
              </Text>
              <View style={styles.featuredFooter}>
                <TouchableOpacity
                  style={styles.readMoreButton}
                  onPress={() => navigateToInsightDetails(featuredInsight)}>
                  <Text style={styles.readMoreButtonText}>Read More</Text>
                </TouchableOpacity>
                {featuredInsight.read_time && (
                  <Text style={styles.readTime}>
                    {featuredInsight.read_time} min read
                  </Text>
                )}
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Explore Latest Section */}
        <View style={styles.exploreSection}>
          <View style={styles.exploreHeader}>
            <Text style={styles.sectionTitle}>Explore Latest</Text>
            <Text style={styles.resultsCount}>
              {exploreInsights.length}{' '}
              {exploreInsights.length === 1 ? 'result' : 'results'}
            </Text>
          </View>
          {exploreInsights.length > 0 ? (
            exploreInsights.map(insight => (
              <TouchableOpacity
                key={insight.id}
                style={styles.exploreCard}
                onPress={() => navigateToInsightDetails(insight)}
                activeOpacity={0.9}>
                <View style={styles.exploreImageContainer}>
                  <Image
                    source={getImageSource(insight.image)}
                    style={styles.exploreImage}
                    resizeMode="cover"
                  />
                </View>
                <View style={styles.exploreContent}>
                  <View style={styles.titleContainer}>
                    <Text style={styles.exploreTitle} numberOfLines={2}>
                      {insight.title}
                    </Text>
                  </View>
                  <View style={styles.exploreFooter}>
                    <Text style={styles.exploreTime}>
                      {insight.read_time || 5} min read
                    </Text>
                    <View style={styles.arrowContainer}>
                      <Image
                        source={appIcons.forwardArrow}
                        style={styles.arrowImage}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateTitle}>No insights to explore</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Check back soon for new insights'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default CommunityInsight;
