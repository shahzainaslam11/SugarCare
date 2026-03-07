import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {appImages, appIcons} from '../../../../utilities';
import styles from './styles';

const {width: SCREEN_WIDTH} = Dimensions.get('window');
const HERO_HEIGHT = 280;

const InsightDetails = ({route}) => {
  const navigation = useNavigation();

  const {title, description, image, read_time} = route.params || {
    title: '5 Foods That Help Stabilize Blood Sugar',
    description:
      'Based on 2,000 SugarCare users, oats are one of the best breakfast choices for stabilizing blood sugar. Other top foods include berries, nuts, leafy greens, and lean proteins. These options provide a balanced mix of fiber, healthy fats, and low glycemic index nutrients that help prevent spikes and support steady energy throughout the day.\n\nIncorporating these foods into your meals can make a real difference in how you feel and how your body manages glucose. Start with one or two and build from there.',
    image: appImages.p1,
    read_time: 5,
  };

  const getImageSource = img => {
    if (!img) return appImages.p1;
    if (typeof img === 'string') return {uri: img};
    return img;
  };

  const readTime = read_time ?? 5;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={true}>
        {/* Hero image with overlay */}
        <View style={styles.heroWrap}>
          <Image
            source={getImageSource(image)}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay} />
          <SafeAreaView edges={['top']} style={styles.headerSafe}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}>
              <Image
                source={appIcons.back_Arrow}
                style={styles.backIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </SafeAreaView>
        </View>

        {/* Content card overlapping hero */}
        <View style={styles.contentCard}>
          <View style={styles.metaRow}>
            <View style={styles.readTimeChip}>
              <Text style={styles.readTimeText}>{readTime} min read</Text>
            </View>
            <View style={styles.insightBadge}>
              <Text style={styles.insightBadgeText}>Community Insight</Text>
            </View>
          </View>

          <Text style={styles.insightTitle}>{title}</Text>
          <View style={styles.divider} />
          <Text style={styles.description}>{description}</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default InsightDetails;
