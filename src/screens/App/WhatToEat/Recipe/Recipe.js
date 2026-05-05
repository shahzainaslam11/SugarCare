import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Share,
} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {appImages, colors, family, size, WP, HP} from '../../../../utilities';
import styles from './styles';
import {Header, MedicalDisclaimer, NutritionCard} from '../../../../components';

const Recipe = ({route}) => {
  const navigation = useNavigation();

  const {meal, mealType, userData} = route.params || {};
  console.log('meal---->', JSON.stringify(meal));

  const mealName = meal?.name || 'Quinoa Salad with Chickpeas and Avocado';
  const mealDescription =
    meal?.description || 'A nutritious and balanced meal for optimal health';
  const mealImage = meal?.image_url ? {uri: meal.image_url} : appImages.p11;
  const nutrition_facts = meal?.nutrition_facts || null;
  const glycemic_index = meal?.glycemic_index || null;

  console.log('Meal data from API:', meal);
  console.log('Nutrition facts:', nutrition_facts);
  console.log('Glycemic index:', glycemic_index);

  // Prepare nutrition data for NutritionCard
  const format2 = val => {
    const num = Number(val);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  };

  const getNutritionCardData = () => {
    if (nutrition_facts && glycemic_index !== null) {
      const getGIStatus = gi => {
        if (gi <= 55) return 'Low';
        if (gi <= 69) return 'Medium';
        return 'High';
      };

      const giStatus = getGIStatus(glycemic_index);

      return {
        glycemicIndex: format2(glycemic_index),
        giStatus,
        carbohydrates: `${format2(nutrition_facts.carbohydrates_g)}g`,
        fatValue: `${format2(nutrition_facts.fats_g)}g`,
        proteinValue: `${format2(nutrition_facts.proteins_g)}g`,
        sugarValue: `${format2(nutrition_facts.sugar_g)}g`,
        fibreValue: `${format2(nutrition_facts.fiber_g)}g`,
        data: [1],
      };
    }

    if (nutrition_facts) {
      return {
        glycemicIndex: 'N/A',
        giStatus: 'N/A',
        carbohydrates: `${format2(nutrition_facts.carbohydrates_g)}g`,
        fatValue: `${format2(nutrition_facts.fats_g)}g`,
        proteinValue: `${format2(nutrition_facts.proteins_g)}g`,
        sugarValue: `${format2(nutrition_facts.sugar_g)}g`,
        fibreValue: `${format2(nutrition_facts.fiber_g)}g`,
        data: [1],
      };
    }

    // ✅ No API data → show nothing meaningful instead of fake values
    return {
      glycemicIndex: 'N/A',
      giStatus: 'N/A',
      carbohydrates: '0.00g',
      fatValue: '0.00g',
      proteinValue: '0.00g',
      sugarValue: '0.00g',
      fibreValue: '0.00g',
      data: [],
    };
  };

  const nutritionCardData = getNutritionCardData();

  // Debug logging
  console.log('=== Nutrition Card Data ===');
  console.log('nutritionCardData:', JSON.stringify(nutritionCardData, null, 2));
  console.log('nutrition_facts:', JSON.stringify(nutrition_facts, null, 2));
  console.log('glycemic_index:', glycemic_index);
  console.log('==========================');

  // Handle share
  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${mealType} recipe: ${mealName}\n\nDescription: ${mealDescription}\n\nNutrition: Protein: ${nutritionCardData.proteinValue}, Carbs: ${nutritionCardData.carbohydrates}, Fats: ${nutritionCardData.fatValue}, GI: ${nutritionCardData.glycemicIndex} (${nutritionCardData.giStatus})`,
        title: `${mealName} Recipe`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Generate cooking instructions based on actual meal data
  const generateCookingInstructions = () => {
    // Use the meal description to create more relevant instructions
    if (mealDescription && mealDescription.length > 0) {
      // Extract key points from description
      const description = mealDescription.toLowerCase();
      let instructions = [];

      if (description.includes('grill') || description.includes('grilled')) {
        instructions.push('Preheat grill to medium-high heat');
        instructions.push('Season the main protein with herbs and spices');
        instructions.push('Grill for recommended time until cooked through');
      }

      if (description.includes('salad') || description.includes('fresh')) {
        instructions.push('Wash all vegetables thoroughly');
        instructions.push('Chop vegetables into bite-sized pieces');
        instructions.push('Combine ingredients in a large bowl');
      }

      if (description.includes('soup') || description.includes('stew')) {
        instructions.push('Sauté aromatics in a large pot');
        instructions.push('Add main ingredients and broth');
        instructions.push('Simmer until flavors are developed');
      }

      if (description.includes('bake') || description.includes('oven')) {
        instructions.push('Preheat oven to recommended temperature');
        instructions.push('Prepare ingredients in baking dish');
        instructions.push('Bake until golden and cooked through');
      }

      // Add general instructions if we don't have enough
      if (instructions.length < 3) {
        instructions = [
          'Prepare all ingredients as needed',
          'Cook using healthy methods (steam, grill, or bake)',
          'Season with herbs and spices to taste',
          'Serve immediately for best flavor',
        ];
      }

      return instructions
        .map((instruction, index) => `${index + 1}. ${instruction}`)
        .join('\n');
    }

    // Fallback instructions if no description
    const fallbackInstructions = {
      breakfast: [
        'Prepare all ingredients fresh',
        'Cook using minimal oil',
        'Combine ingredients gently',
        'Serve immediately for best taste',
      ],
      lunch: [
        'Wash and chop vegetables',
        'Cook protein thoroughly',
        'Combine with grains',
        'Add dressing before serving',
      ],
      dinner: [
        'Use light cooking methods',
        'Season with herbs',
        'Cook until tender',
        'Serve warm',
      ],
      snacks: [
        'Portion ingredients',
        'Combine as needed',
        'Serve fresh',
        'Store properly',
      ],
    };

    const mealInstructions =
      fallbackInstructions[mealType] || fallbackInstructions.lunch;
    return mealInstructions
      .map((instruction, index) => `${index + 1}. ${instruction}`)
      .join('\n');
  };

  // Generate health benefits based on nutrition data
  const generateHealthBenefits = () => {
    const benefits = [
      `✓ Balanced with ${nutritionCardData.proteinValue} protein, ${nutritionCardData.carbohydrates} carbs, and ${nutritionCardData.fatValue} fats`,
    ];

    if (nutritionCardData.giStatus === 'Low') {
      benefits.push('✓ Low glycemic index for stable blood sugar levels');
    } else if (nutritionCardData.giStatus === 'Medium') {
      benefits.push('✓ Moderate glycemic index for balanced energy');
    }

    benefits.push(
      `✓ Contains ${nutritionCardData.fibreValue} fiber for digestive health`,
    );

    if (parseFloat(nutritionCardData.sugarValue) < 10) {
      benefits.push('✓ Low in added sugars');
    }

    if (userData?.diabetesType) {
      benefits.push(
        `✓ Diabetes-friendly for ${
          userData.diabetesType === 'type1' ? 'Type 1' : 'Type 2'
        } diabetes management`,
      );
    }

    return benefits;
  };

  // Generate simple ingredients based on meal name
  const generateSimpleIngredients = () => {
    const mealNameLower = mealName.toLowerCase();
    let ingredients = [];

    // Common ingredients based on meal name patterns
    if (mealNameLower.includes('chicken')) {
      ingredients = [
        'Chicken breast',
        'Fresh vegetables',
        'Herbs',
        'Olive oil',
        'Seasonings',
      ];
    } else if (
      mealNameLower.includes('salmon') ||
      mealNameLower.includes('fish')
    ) {
      ingredients = [
        'Salmon fillet',
        'Lemon',
        'Fresh herbs',
        'Olive oil',
        'Seasonings',
      ];
    } else if (mealNameLower.includes('salad')) {
      ingredients = [
        'Mixed greens',
        'Fresh vegetables',
        'Protein of choice',
        'Healthy dressing',
        'Nuts/seeds',
      ];
    } else if (mealNameLower.includes('soup')) {
      ingredients = [
        'Vegetables',
        'Broth',
        'Protein (optional)',
        'Herbs',
        'Seasonings',
      ];
    } else if (
      mealNameLower.includes('eggs') ||
      mealNameLower.includes('omelette')
    ) {
      ingredients = [
        'Eggs',
        'Fresh vegetables',
        'Cheese (optional)',
        'Herbs',
        'Cooking oil',
      ];
    } else {
      // Generic ingredients
      ingredients = [
        'Main protein or vegetable',
        'Fresh vegetables',
        'Whole grains (if applicable)',
        'Healthy fats',
        'Herbs and spices',
      ];
    }

    return ingredients;
  };

  const healthBenefits = generateHealthBenefits();
  const ingredients = generateSimpleIngredients();
  const cookingInstructions = generateCookingInstructions();

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Smart Meal Insights"
        onPress={() => navigation.goBack()}
        showRightIcon={true}
        onRightPress={handleShare}
        rightIconText="Share"
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Meal Image */}
        <View style={styles.imageContainer}>
          <Image
            source={mealImage}
            style={styles.recipeImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <Text style={styles.mealTypeBadge}>
              {mealType
                ? mealType.charAt(0).toUpperCase() + mealType.slice(1)
                : 'Meal'}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Meal Title - Removed calories badge */}
          <View style={styles.headerSection}>
            <Text style={styles.recipeTitle}>{mealName}</Text>
          </View>

          {/* Nutrition Card */}
          <View style={styles.nutritionCardContainer}>
            <NutritionCard {...nutritionCardData} />
          </View>

          {/* Personalized Info */}

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{mealDescription}</Text>
          </View>

          {/* Ingredients */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientsList}>
              {ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientItem}>
                  <View style={styles.ingredientBullet} />
                  <Text style={styles.ingredientText}>{ingredient}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Cooking Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cooking Instructions</Text>
            <Text style={styles.instructions}>{cookingInstructions}</Text>
          </View>

          {/* Health Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Health Benefits</Text>
            <View style={styles.benefitsList}>
              {healthBenefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Serving Suggestions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Serving Suggestions</Text>
            <Text style={styles.servingSuggestions}>
              • Serve fresh for optimal nutrition{'\n'}• Pair with a side of
              fresh vegetables{'\n'}• Adjust portion size based on your needs
              {'\n'}• Store leftovers in airtight container{'\n'}• Reheat gently
              to preserve nutrients
            </Text>
          </View>

          <MedicalDisclaimer />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Recipe;
