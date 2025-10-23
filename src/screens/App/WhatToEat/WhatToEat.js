import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import React, {useState} from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header} from '../../../components'; // Adjust the import path as needed
import {useNavigation} from '@react-navigation/native';
import {appImages, colors, family, HP, size, WP} from '../../../utilities';

const WhatToEat = () => {
  const navigation = useNavigation();

  // State to manage the active meal type
  const [activeMealType, setActiveMealType] = useState('Breakfast');

  // Meal data based on meal type
  const mealData = {
    Breakfast: {
      suggested: {
        name: 'Oatmeal with Berries',
        description:
          'A warm bowl of oatmeal topped with fresh berries, providing a balanced start to your day.',
        image: appImages.p1, // Replace with actual image URL or local asset
      },
      alternatives: [
        {
          name: 'Greek Yogurt with Honey',
          image: appImages.p2,
        }, // Replace with actual image
        {name: 'Avocado Toast', image: appImages.p1}, // Replace with actual image
        {
          name: 'Scrambled Eggs with Spinach',
          image: appImages.p2,
        }, // Replace with actual image
      ],
    },
    Lunch: {
      suggested: {
        name: 'Oatmeal with Berries',
        description:
          'A warm bowl of oatmeal topped with fresh berries, providing a balanced start to your day.',
        image: appImages.p2, // Replace with actual image URL or local asset
      },
      alternatives: [
        {
          name: 'Quinoa Salad with Chickpeas and Avocado',
          image: appImages.p11,
        }, // Replace with actual image
        {
          name: 'Mediterranean Wrap with Hummus and Veggies',
          image: appImages.p2,
        }, // Replace with actual image
        {
          name: 'Spinach and Feta Stuffed Sweet Potatoes',
          image: appImages.p2,
        }, // Replace with actual image
      ],
    },
    Dinner: {
      suggested: {
        name: 'Grilled Salmon with Quinoa',
        description:
          'A healthy dinner with grilled salmon and quinoa, rich in omega-3s and protein.',
        image: appImages.p2,
      },
      alternatives: [
        {
          name: 'Chicken Stir-Fry with Veggies',
          image: appImages.p2,
        }, // Replace with actual image
        {
          name: 'Baked Cod with Asparagus',
          image: appImages.p2,
        }, // Replace with actual image
        {name: 'Vegetable Curry', image: appImages.p2}, // Replace with actual image
      ],
    },
    Snacks: {
      suggested: {
        name: 'Mixed Nuts and Fruit',
        description:
          'A quick snack of mixed nuts and fruit for a healthy energy boost.',
        image: appImages.p11, // Replace with actual image URL or local asset
      },
      alternatives: [
        {
          name: 'Carrot Sticks with Hummus',
          image: appImages.p11,
        }, // Replace with actual image
        {
          name: 'Apple Slices with Peanut Butter',
          image: appImages.p2,
        }, // Replace with actual image
        {name: 'Cheese and Crackers', image: appImages.p2}, // Replace with actual image
      ],
    },
  };

  const currentMeal = mealData[activeMealType];

  // Function to navigate to Recipe screen with meal details
  const navigateToRecipe = meal => {
    navigation.navigate('Recipe', {
      mealName: meal.name,
      mealDescription: meal.description || 'No description available',
      mealImage: meal.image,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="What to Eat?" onPress={() => navigation.goBack()} />

      <View style={styles.mealTypeContainer}>
        {['Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.mealTypeButton,
              activeMealType === type && styles.activeButton,
            ]}
            onPress={() => setActiveMealType(type)}>
            <Text
              style={[
                styles.mealTypeText,
                activeMealType === type && styles.mealTypeTextActive,
              ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Suggested Meal Section */}
        <View style={styles.suggestedMealSection}>
          <Text style={styles.sectionTitle}>Suggested Meal</Text>
          <TouchableOpacity
            style={styles.mealCard}
            onPress={() => navigateToRecipe(currentMeal.suggested)}>
            <Image
              source={currentMeal.suggested.image}
              style={styles.mealImage}
              resizeMode="cover"
            />
            <Text style={styles.mealName}>{currentMeal.suggested.name}</Text>
            <Text style={styles.mealDescription}>
              {currentMeal.suggested.description}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Healthier Alternatives Section */}
        <View style={styles.alternativesSection}>
          <Text style={styles.sectionTitle}>Healthier Alternatives</Text>
          {currentMeal.alternatives.map((alternative, index) => (
            <TouchableOpacity
              key={index}
              style={styles.alternativeCard}
              onPress={() => navigateToRecipe(alternative)}>
              <Image
                source={alternative.image}
                style={styles.alternativeImage}
                resizeMode="cover"
              />
              <View style={styles.alternativeText}>
                <Text style={styles.alternativeName}>{alternative.name}</Text>
              </View>
            </TouchableOpacity>
          ))}
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
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: HP(0.7),
    backgroundColor: colors.g15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    marginHorizontal: WP(2),
    borderRadius: 30,
  },
  mealTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeButton: {
    backgroundColor: colors.p1,
  },
  mealTypeText: {
    color: colors.b1,
    fontSize: size.medium,
    fontFamily: family.inter_medium,
  },
  mealTypeTextActive: {
    color: colors.white,
    fontSize: size.medium,
    fontFamily: family.inter_medium,
  },
  suggestedMealSection: {
    padding: 20,
    backgroundColor: '#ffffff',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 10,
  },
  mealCard: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  mealImage: {
    width: '100%',
    height: 200,
  },
  mealName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
    padding: 10,
  },
  mealDescription: {
    fontSize: 14,
    color: '#7f8c8d',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  alternativesSection: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  alternativeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    marginBottom: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  alternativeImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  alternativeText: {
    flex: 1,
  },
  alternativeName: {
    fontSize: 16,
    color: '#2c3e50',
  },
});

export default WhatToEat;
