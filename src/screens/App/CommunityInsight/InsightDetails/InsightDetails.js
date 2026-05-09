import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {appImages, appIcons} from '../../../../utilities';
import styles from './styles';

const InsightDetails = ({route}) => {
  const navigation = useNavigation();

  const fallbackInsight = {
    title: '5 Foods That Help Stabilize Blood Sugar',
    description:
      'Based on 2,000 SugarCare users, oats are one of the best breakfast choices for stabilizing blood sugar. Other top foods include berries, nuts, leafy greens, and lean proteins. These options provide a balanced mix of fiber, healthy fats, and low glycemic index nutrients that help prevent spikes and support steady energy throughout the day.\n\nIncorporating these foods into your meals can make a real difference in how you feel and how your body manages glucose. Start with one or two and build from there.',
    image: appImages.p1,
    read_time: 5,
    author_name: '',
    created_at: '',
    featured: false,
  };
  const rawInsight = route?.params?.insight || route?.params || fallbackInsight;
  const insight =
    rawInsight && typeof rawInsight === 'object' ? rawInsight : fallbackInsight;
  const {title, description, image, read_time, author_name, created_at, featured} = insight;

  const getImageSource = img => {
    if (!img) return appImages.p1;
    if (typeof img === 'string') return {uri: img};
    return img;
  };

  const hasValue = value =>
    value !== null &&
    value !== undefined &&
    !(typeof value === 'string' && value.trim() === '');

  const parsedReadTime = Number(read_time);
  const readTime =
    Number.isFinite(parsedReadTime) && parsedReadTime > 0 ? parsedReadTime : null;
  const authorName = hasValue(author_name) ? author_name : null;
  const createdAt = hasValue(created_at) ? created_at : null;
  const hasDescription = hasValue(description);
  const hasTitle = hasValue(title);

  const formatCreatedAt = value => {
    if (!hasValue(value)) return null;
    const normalized = String(value).replace(' ', 'T');
    const date = new Date(normalized);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formattedCreatedAt = formatCreatedAt(createdAt);

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
            {readTime ? (
              <View style={styles.readTimeChip}>
                <Text style={styles.readTimeText}>{readTime} min read</Text>
              </View>
            ) : null}
            {featured ? (
              <View style={styles.featuredChip}>
                <Text style={styles.featuredChipText}>Featured</Text>
              </View>
            ) : null}
          </View>

          {hasTitle ? (
            <View style={styles.titleBlock}>
              <View style={styles.titleAccent} />
              <Text style={styles.insightTitle}>{title}</Text>
            </View>
          ) : null}
          {authorName || formattedCreatedAt ? (
            <View style={styles.bylineRow}>
              {authorName ? (
                <View style={styles.authorChip}>
                  <Text style={styles.authorLabel}>Author</Text>
                  <Text style={styles.authorNameText}>{authorName}</Text>
                </View>
              ) : null}
              {formattedCreatedAt ? (
                <View style={styles.dateChip}>
                  <Text style={styles.dateChipText}>{formattedCreatedAt}</Text>
                </View>
              ) : null}
            </View>
          ) : null}
          {hasDescription ? (
            <>
              <View style={styles.divider} />
              <Text style={styles.description}>{description}</Text>
            </>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
};

export default InsightDetails;
