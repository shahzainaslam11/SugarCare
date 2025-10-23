import {View, Text, ScrollView, StyleSheet, Image} from 'react-native';
import React from 'react';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import {Header} from '../../../../components'; // Adjust the import path as needed
import {appImages, colors, family, size, WP, HP} from '../../../../utilities'; // Adjust the import path as needed

const Recipe = ({route}) => {
  const navigation = useNavigation();
  const {mealName, mealDescription, mealImage} = route.params || {
    mealName: 'Quinoa Salad with Chickpeas and Avocado',
    mealDescription:
      'To create a refreshing and nutritious dish, start with these ingredients:\n\n1. Cooked quinoa\n2. Chickpeas\n3. Diced avocado\n4. Zesty lemon vinaigrette (made from fresh lemon juice, olive oil, and a hint of garlic)\n\nThese components provide a hearty texture along with protein and fiber. The creamy avocado adds richness, while the lemon vinaigrette ties everything together beautifully.\n\nThis vibrant salad is quick to prepare and incredibly versatile. Enjoy it as a light lunch or a side dish at dinner. You can also add cherry tomatoes, cucumber, or feta cheese for extra flavor!',
    mealImage: appImages.p11, // Default image, replace with actual asset
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Recipe" onPress={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={mealImage}
            style={styles.recipeImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.content}>
          <Text style={styles.recipeTitle}>{mealName}</Text>
          <Text style={styles.description}>{mealDescription}</Text>
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
  recipeImage: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: WP(4),
  },
  recipeTitle: {
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

export default Recipe;
