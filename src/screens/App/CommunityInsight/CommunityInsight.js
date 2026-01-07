import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {Header} from '../../../components';
import {colors, appImages} from '../../../utilities';
import {fetchCommunityInsights} from '../../../redux/slices/communityInsightsSlice';
import styles from './styles';

const CommunityInsight = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {accessToken, user} = useSelector(state => state.auth);

  const {insights, loading, error} = useSelector(
    state => state.communityInsights,
  );
  console.log('insights--->', JSON.stringify(insights));

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (accessToken) {
      dispatch(fetchCommunityInsights({token: accessToken, user_id: user.id}));
    }
  }, [dispatch, accessToken]);

  // Function to navigate to Insight Details screen with insight data
  const navigateToInsightDetails = insight => {
    navigation.navigate('InsightDetails', {
      title: insight.title,
      description: insight.description || 'No description available',
      image: insight.image,
    });
  };

  // Filter insights based on search query
  const filteredInsights = insights.filter(insight =>
    insight.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Featured: pick the first insight or fallback
  const featuredInsight = filteredInsights[0] || {
    title: 'No Featured Insight',
    description: 'No description available',
    image: appImages.p1,
  };

  // Explore: remaining insights
  const exploreInsights = filteredInsights.slice(1);

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
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={colors.p1} />
        ) : error ? (
          <Text style={{color: 'red', textAlign: 'center', marginTop: 20}}>
            {error}
          </Text>
        ) : (
          <>
            {/* Featured Section */}
            <View style={styles.featuredSection}>
              <Text style={styles.sectionTitle}>Featured</Text>
              <TouchableOpacity
                style={styles.featuredCard}
                onPress={() => navigateToInsightDetails(featuredInsight)}>
                <Image
                  source={{uri: featuredInsight.image}}
                  style={styles.featuredImage}
                  resizeMode="cover"
                />
                <View style={styles.featuredText}>
                  <Text style={styles.featuredTitle}>
                    {featuredInsight.title}
                  </Text>
                  <Text style={styles.featuredDescription}>
                    {featuredInsight.description}
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
              {exploreInsights.length > 0 ? (
                exploreInsights.map(insight => (
                  <TouchableOpacity
                    key={insight.id}
                    style={styles.exploreCard}
                    onPress={() => navigateToInsightDetails(insight)}>
                    <Image
                      source={{uri: insight.image}}
                      style={styles.exploreImage}
                      resizeMode="cover"
                    />
                    <View style={styles.exploreText}>
                      <Text style={styles.exploreTitle}>{insight.title}</Text>
                      <Text style={styles.exploreTime}>
                        {insight.read_time} min read
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{textAlign: 'center', marginTop: 20}}>
                  No more insights to explore
                </Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default CommunityInsight;
