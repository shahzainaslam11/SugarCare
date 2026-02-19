import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {SafeAreaView} from 'react-native-safe-area-context';
import FastImage from 'react-native-fast-image';
import ImageResizer from 'react-native-image-resizer';
import {appIcons, colors} from '../../../../utilities';
import {Header, MedicalDisclaimer, NutritionCard} from '../../../../components';
import styles from './styles';

const ScanResult = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const reduxResult = useSelector(state => state.food?.result);
  const paramsData = route.params?.scanData;
  // Use Redux result first (reliable), fallback to route params
  const scanData = reduxResult || paramsData;
  console.log('scanData--->', JSON.stringify(scanData));

  // Hooks must be at the top
  const [fixedImageUri, setFixedImageUri] = useState(null);
  const [loadingImage, setLoadingImage] = useState(false);

  // Use image: remote URLs go directly to FastImage; local URIs can be resized
  useEffect(() => {
    if (scanData?.image_url) {
      const url = scanData.image_url;
      if (url.startsWith('http://') || url.startsWith('https://')) {
        setFixedImageUri(url);
      } else {
        setLoadingImage(true);
        ImageResizer.createResizedImage(url, 800, 800, 'JPEG', 100)
          .then(resized => setFixedImageUri(resized.uri))
          .catch(() => setFixedImageUri(url))
          .finally(() => setLoadingImage(false));
      }
    }
  }, [scanData?.image_url]);

  // Early return if no scan data
  if (!scanData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>No scan data available.</Text>
      </SafeAreaView>
    );
  }

  const {
    food_item,
    estimated_calories,
    predicted_impact,
    nutrition_facts,
    glycemic_index,
    suggestion,
    confidence_score,
  } = scanData;
  // Debug logging
  console.log('=== Scan Result Data ===');
  console.log('scanData:', JSON.stringify(scanData, null, 2));
  console.log('nutrition_facts:', JSON.stringify(nutrition_facts, null, 2));
  console.log('glycemic_index:', JSON.stringify(glycemic_index, null, 2));

  const format2 = val => {
    const num = Number(val);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  };

  const nutritionData = {
    glycemicIndex: glycemic_index?.value
      ? format2(glycemic_index.value)
      : 'N/A',
    giStatus: glycemic_index?.category || 'N/A',

    carbohydrates: nutrition_facts?.carbohydrates_g
      ? `${format2(nutrition_facts.carbohydrates_g)}g`
      : '0.00g',

    fatValue: nutrition_facts?.fats_g
      ? `${format2(nutrition_facts.fats_g)}g`
      : '0.00g',

    proteinValue: nutrition_facts?.proteins_g
      ? `${format2(nutrition_facts.proteins_g)}g`
      : '0.00g',

    sugarValue: nutrition_facts?.sugar_g
      ? `${format2(nutrition_facts.sugar_g)}g`
      : '0.00g',

    fibreValue: nutrition_facts?.fiber_g
      ? `${format2(nutrition_facts.fiber_g)}g`
      : '0.00g',

    data: [1],
  };

  console.log('nutritionData (final):', JSON.stringify(nutritionData, null, 2));
  console.log('========================');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header title="Scan Result" onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          {loadingImage ? (
            <ActivityIndicator size="large" color={colors.p1} />
          ) : fixedImageUri ? (
            <FastImage
              source={{uri: fixedImageUri, priority: FastImage.priority.normal}}
              style={styles.foodImage}
              resizeMode={FastImage.resizeMode.cover}
            />
          ) : (
            <Image
              source={appIcons.bowl}
              style={styles.foodImage}
              resizeMode="cover"
            />
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.foodName}>
              {food_item?.charAt(0).toUpperCase() + food_item?.slice(1)}
            </Text>

            <View style={styles.caloriesContainer}>
              <Image source={appIcons.fire} style={styles.fireIcon} />
              <Text style={styles.calories}>{estimated_calories} kcal</Text>
            </View>
          </View>

          <View style={styles.predictedImpact}>
            <Text style={styles.impactMessage}>
              {predicted_impact?.message}
            </Text>
            <Text style={styles.impactNote}>
              {predicted_impact?.confidence_note}
            </Text>
          </View>
          {/* 
          {confidence_score && (
            <View style={styles.confidenceBox}>
              <Text style={styles.confidenceText}>
                Confidence Score: {(confidence_score * 100).toFixed(0)}%
              </Text>
            </View>
          )} */}

          <NutritionCard {...nutritionData} />

          {suggestion && (
            <View style={styles.suggestionBox}>
              <Text style={styles.suggestionText}>{suggestion}</Text>
            </View>
          )}

          <MedicalDisclaimer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ScanResult;
