import {View, Text, ScrollView, StyleSheet, Image} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Header} from '../../../../components'; // Adjust the import path as needed
import {appImages, colors, family, size, WP, HP} from '../../../../utilities'; // Adjust the import path as needed

const InsightDetails = ({route}) => {
  const navigation = useNavigation();
  const {title, description, image} = route.params || {
    title: '5 Foods That Help Stabilize Blood Sugar',
    description:
      'Based on 2,000 SugarCare users, oats are one of the best breakfast choices for stabilizing blood sugar. Other top foods include berries, nuts, leafy greens, and lean proteins. These options provide a balanced mix of fiber, healthy fats, and low glycemic index nutrients...',
    image: appImages.p1, // Default image, replace with actual asset
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Insight Details" onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={image}
            style={styles.insightImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.insightTitle}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: WP(4),
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    margin: WP(2),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  insightImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: WP(4),
  },
  insightTitle: {
    fontSize: size.xlarge,
    fontWeight: '600',
    color: colors.b1,
    fontFamily: family.inter_bold,
    marginBottom: HP(1),
  },
  description: {
    fontSize: size.normal,
    color: colors.g9,
    fontFamily: family.inter_regular,
    lineHeight: 22,
  },
});

export default InsightDetails;
