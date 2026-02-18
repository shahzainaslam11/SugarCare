import {View, Text, ScrollView, Image} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Header} from '../../../../components'; // Adjust as needed
import {appImages} from '../../../../utilities'; // Adjust as needed
import styles from './styles';

const InsightDetails = ({route}) => {
  const navigation = useNavigation();

  const {title, description, image} = route.params || {
    title: '5 Foods That Help Stabilize Blood Sugar',
    description:
      'Based on 2,000 SugarCare users, oats are one of the best breakfast choices for stabilizing blood sugar. Other top foods include berries, nuts, leafy greens, and lean proteins. These options provide a balanced mix of fiber, healthy fats, and low glycemic index nutrients...',
    image: appImages.p1, // default local image
  };

  // Safe image source handling: remote URI or local asset
  const getImageSource = img => {
    if (!img) return appImages.p1;
    if (typeof img === 'string') return {uri: img};
    return img; // already local asset
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Insight Details" onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Image */}
        <View style={styles.imageContainer}>
          <Image
            source={getImageSource(image)}
            style={styles.insightImage}
            resizeMode="cover"
          />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Text style={styles.insightTitle}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default InsightDetails;
