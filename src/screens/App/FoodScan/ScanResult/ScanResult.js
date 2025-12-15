import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
// Assuming the following utilities/assets are available based on your original file
import {appIcons, colors, family, size, WP} from '../../../../utilities';
import {Header} from '../../../../components';

const ScanResult = () => {
  const navigation = useNavigation();

  // Mock data matching the screenshot content
  const contentData = {
    title: '5 Foods That Help Stabilize Blood Sugar',
    calories: '550 kcal',
    glycemicIndex: '50 mg/dL',
    giStatus: 'Low',
    carbohydrates: '22g',
    // Reverting to your original icon structure assumptions but adding a color hint
    nutrients: [
      {label: 'Fats', value: '60g', icon: appIcons.fats}, // Reddish-Brown
      {
        label: 'Protein',
        value: '27g',
        icon: appIcons.protien,
      }, // Green
      {label: 'Sugar', value: '22g', icon: appIcons.sugar}, // Orange/Amber
      {label: 'Fibre', value: '9.9g', icon: appIcons.carbs}, // Blue
    ],
    recipeIntro:
      'Maintaining stable blood sugar levels is crucial for overall health. Here are five foods that can help you achieve that:',
    foodList: [
      {
        id: 1,
        title: 'Leafy Greens:',
        description:
          'Spinach, kale, and Swiss chard are low in calories and high in fiber, making them excellent for blood sugar control.',
      },
      {
        id: 2,
        title: 'Nuts:',
        description:
          'Almonds, walnuts, and pistachios provide healthy fats and protein, which can slow down the absorption of sugar into your bloodstream.',
      },
      {
        id: 3,
        title: 'Berries:',
        description:
          'Blueberries, strawberries, and raspberries are rich in antioxidants and fiber, helping to regulate blood sugar levels.',
      },
      {
        id: 4,
        title: 'Whole Grains:',
        description:
          'Foods like brown rice, quinoa, and oats are packed with fiber and nutrients that help maintain steady blood sugar.',
      },
      {
        id: 5,
        title: 'Legumes:',
        description:
          'Beans, lentils, and chickpeas are high in protein and fiber, making them great...',
      },
    ],
  };

  const GI_Carbs_Box = ({title, value, status, isGI}) => (
    <View style={isGI ? styles.giBox : styles.carbsBox}>
      <Text style={styles.giCarbsTitle}>{title}</Text>
      {isGI ? (
        <View style={styles.giContent}>
          <Text style={styles.giCarbsValue}>{value}</Text>
          <View style={styles.giStatusBadge}>
            <Text style={styles.giStatusText}>{status}</Text>
          </View>
        </View>
      ) : (
        <Text style={styles.giCarbsValue}>{value}</Text>
      )}
    </View>
  );

  const NutrientFactItem = ({value, label, icon, color}) => (
    <View style={styles.nutrientFactItem}>
      {/* Icon implementation as seen in the SS - simple icon inside the tile */}
      <Image
        source={icon}
        style={[styles.nutrientIcon, {tintColor: color}]}
        resizeMode="contain"
      />
      <Text style={styles.nutrientFactValue}>{value}</Text>
      <Text style={styles.nutrientFactLabel}>{label}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      <Header title="Scan Result" onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Image Section */}
        <View style={styles.imageContainer}>
          <Image
            source={appIcons.bowl} // Placeholder for the food image
            style={styles.foodImage}
            resizeMode="cover"
          />
          {/* Custom Back Button (Top Left) - Simple, dark arrow as in SS */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Image
              source={appIcons.backArrow}
              style={styles.backIcon}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Title & Calories Row */}
          <View style={styles.titleSection}>
            <Text style={styles.foodName}>{contentData.title}</Text>
            <View style={styles.caloriesContainer}>
              <Image source={appIcons.fire} style={styles.fireIcon} />
              <Text style={styles.calories}>{contentData.calories}</Text>
            </View>
          </View>

          {/* Nutrients Facts Title */}
          <Text style={styles.nutrientsFactsTitle}>Nutrients Facts:</Text>

          {/* Glycemic Index & Carbohydrates Row */}
          <View style={styles.giCarbsRow}>
            <GI_Carbs_Box
              title="Glycemic Index:"
              value={contentData.glycemicIndex}
              status={contentData.giStatus}
              isGI={true}
            />
            <GI_Carbs_Box
              title="Carbohydrates"
              value={contentData.carbohydrates}
              isGI={false}
            />
          </View>

          {/* Main Nutrient Facts Grid (4 Items) */}
          <View style={styles.nutrientFactsGrid}>
            {contentData.nutrients.map((item, index) => (
              <NutrientFactItem key={index} {...item} />
            ))}
          </View>

          {/* Recipe/Food List Section */}
          <View style={styles.recipeSection}>
            <Text style={styles.recipeTitle}>Recipe:</Text>
            <Text style={styles.recipeIntro}>{contentData.recipeIntro}</Text>

            {/* Food List */}
            {contentData.foodList.map((food, index) => (
              <View key={food.id} style={styles.foodListItem}>
                <Text style={styles.foodListItemTitle}>
                  {`${index + 1}. ${food.title} `}
                  <Text style={styles.foodListItemDescription}>
                    {food.description}
                  </Text>
                </Text>
              </View>
            ))}
          </View>
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
  // --- Header/Image Section ---
  imageContainer: {
    width: '100%',
    height: WP('60'), // Height matching the screenshot ratio
  },
  foodImage: {
    width: '100%',
    height: '100%',
  },
  backButton: {
    position: 'absolute',
    top: 50, // Standard offset from top
    left: 20,
  },
  backIcon: {
    width: 20,
    height: 20,
    tintColor: colors.darkGray, // Dark grey/black for the arrow
  },

  // --- Main Content ---
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginBottom: 10, // Tighter margin before "Nutrient Facts"
  },
  foodName: {
    fontSize: size.xl,
    fontWeight: '700',
    color: colors.black,
    flex: 1,
    marginRight: 10,
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fireIcon: {
    width: 14,
    height: 14,
    tintColor: '#FE6C00', // Orange color from screenshot
    marginRight: 4,
  },
  calories: {
    fontSize: size.medium,
    color: colors.darkGray,
    fontWeight: '500',
  },

  // --- GI & Carbs Boxes ---
  nutrientsFactsTitle: {
    fontSize: size.normal,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 10,
  },
  giCarbsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  giBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#eee',
  },
  carbsBox: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#eee',
  },
  giCarbsTitle: {
    fontSize: size.normal,
    color: colors.gray,
    marginBottom: 5,
  },
  giContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giCarbsValue: {
    fontSize: size.medium,
    fontFamily: family.inter_medium,
    color: colors.black,
    marginRight: 8,
  },
  giStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
    backgroundColor: '#E4F4D9', // Light green from SS
  },
  giStatusText: {
    fontSize: size.small,
    color: '#65A30D', // Darker green from SS
    fontWeight: '600',
  },

  // --- Main Nutrient Facts Grid (4 Items) ---
  nutrientFactsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  nutrientFactItem: {
    alignItems: 'center',
    justifyContent: 'center',
    width: WP('21'), // Adjusted width for perfect spacing of 4 items
    height: 100,
    borderRadius: 12,
    padding: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  nutrientIcon: {
    width: 25,
    height: 25,
    marginBottom: 5,
  },
  nutrientFactValue: {
    fontSize: size.normal,
    fontWeight: '700',
    color: colors.black,
    lineHeight: 22,
  },
  nutrientFactLabel: {
    fontSize: size.tiny,
    color: colors.gray,
    fontWeight: '500',
    textAlign: 'center',
  },

  // --- Recipe List ---
  recipeSection: {
    paddingBottom: 20,
  },
  recipeTitle: {
    fontSize: size.normal,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 10,
  },
  recipeIntro: {
    fontSize: size.normal,
    color: colors.darkGray,
    lineHeight: 22,
    marginBottom: 20,
  },
  foodListItem: {
    marginBottom: 15,
  },
  foodListItemTitle: {
    fontSize: size.normal,
    fontWeight: '700',
    color: colors.black,
    lineHeight: 22,
  },
  foodListItemDescription: {
    fontWeight: '400', // Making the description lighter
    color: colors.darkGray,
  },
});

export default ScanResult;
