import React, {useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header, AppInput} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {appImages, family, HP, size, WP} from '../../../utilities';
import styles from './styles';

const WhatToEat = () => {
  const navigation = useNavigation();

  const [activeMealType, setActiveMealType] = useState('Breakfast');
  const [modalVisible, setModalVisible] = useState(false);
  const [personalizedMeal, setPersonalizedMeal] = useState(null);

  // Validation Schema - ALL fields REQUIRED
  const validationSchema = Yup.object().shape({
    currentGlucose: Yup.number()
      .typeError('Must be a valid number')
      .positive('Glucose must be positive')
      .min(50, 'Value too low')
      .max(400, 'Value too high')
      .required('Current glucose is required'),

    diabetesControlLevel: Yup.number()
      .typeError('Must be a valid number')
      .positive('HbA1c must be positive')
      .min(4, 'Value too low')
      .max(15, 'Value too high')
      .required('Diabetes control level (HbA1c) is required'),

    mealDescription: Yup.string()
      .trim()
      .required('Meal description is required')
      .max(100, 'Description too long (max 100 characters)'),

    portionSize: Yup.string()
      .trim()
      .required('Portion size is required')
      .max(50, 'Portion size too long'),
  });

  // Personalization logic
  const getPersonalizedMeal = values => {
    const glucose = parseFloat(values.currentGlucose);
    const hba1c = parseFloat(values.diabetesControlLevel);

    let suggestion = {
      name: 'Balanced Veggie Bowl',
      image: appImages.p11,
      description:
        'Low glycemic, fiber-rich meal suitable for your current levels.',
    };

    if (glucose > 160 || hba1c > 7.0) {
      suggestion = {
        name: 'Grilled Fish with Steamed Greens',
        image: appImages.p2,
        description:
          'Very low carb, high protein to help stabilize high glucose.',
      };
    } else if (
      glucose < 100 &&
      values.portionSize.toLowerCase().includes('large')
    ) {
      suggestion = {
        name: 'Quinoa Salad with Chickpeas & Avocado',
        image: appImages.p1,
        description: 'Healthy carbs and fats to maintain stable energy.',
      };
    } else if (values.mealDescription.toLowerCase().includes('sweet')) {
      suggestion = {
        name: 'Greek Yogurt with Berries & Nuts',
        image: appImages.p11,
        description: 'Low-sugar sweet option with protein and healthy fats.',
      };
    }

    return {
      ...suggestion,
      description: `${suggestion.description}\n\nTailored for glucose: ${glucose} mg/dL, HbA1c: ${hba1c}%, portion: ${values.portionSize}.`,
    };
  };

  // Default meals
  const defaultMeal = {
    Breakfast: {name: 'Oatmeal with Berries', image: appImages.p11},
    Lunch: {name: 'Quinoa Salad with Chickpeas', image: appImages.p1},
    Dinner: {name: 'Grilled Salmon with Veggies', image: appImages.p2},
    Snacks: {name: 'Mixed Nuts and Apple', image: appImages.p11},
  };

  const currentMeal = personalizedMeal || defaultMeal[activeMealType];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="What to Eat?" onPress={() => navigation.goBack()} />

      {/* Personalize Button */}
      <View style={styles.personalizeContainer}>
        <TouchableOpacity
          style={styles.personalizeButton}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.personalizeText}>Get Personalized Meal</Text>
        </TouchableOpacity>
      </View>

      {/* Meal Type Tabs */}
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
        <View style={styles.suggestedMealSection}>
          <Text style={styles.sectionTitle}>
            {personalizedMeal ? 'Your Personalized Meal' : 'Suggested Meal'}
          </Text>

          <TouchableOpacity style={styles.mealCard}>
            <Image
              source={currentMeal.image}
              style={styles.mealImage}
              resizeMode="cover"
            />
            <Text style={styles.mealName}>{currentMeal.name}</Text>
            <Text style={styles.mealDescription}>
              {currentMeal.description ||
                'A healthy and balanced option for you.'}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Personalization Modal - All Fields Required */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Personalize Your Meal</Text>

            <Formik
              initialValues={{
                currentGlucose: '',
                diabetesControlLevel: '',
                mealDescription: '',
                portionSize: '',
              }}
              validationSchema={validationSchema}
              onSubmit={values => {
                const meal = getPersonalizedMeal(values);
                setPersonalizedMeal(meal);
                setModalVisible(false);
              }}>
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View>
                  {/* Current Glucose */}
                  <AppInput
                    title="Current Glucose (mg/dL)"
                    placeholder="e.g. 140"
                    keyboardType="numeric"
                    value={values.currentGlucose}
                    onChangeText={handleChange('currentGlucose')}
                    onBlur={handleBlur('currentGlucose')}
                    errorMessage={
                      touched.currentGlucose && errors.currentGlucose
                        ? errors.currentGlucose
                        : ''
                    }
                  />

                  {/* Diabetes Control Level (HbA1c) */}
                  <AppInput
                    title="Diabetes Control Level (HbA1c %)"
                    placeholder="e.g. 6.5"
                    keyboardType="decimal-pad"
                    value={values.diabetesControlLevel}
                    onChangeText={handleChange('diabetesControlLevel')}
                    onBlur={handleBlur('diabetesControlLevel')}
                    errorMessage={
                      touched.diabetesControlLevel &&
                      errors.diabetesControlLevel
                        ? errors.diabetesControlLevel
                        : ''
                    }
                  />

                  {/* Meal Description */}
                  <AppInput
                    title="Meal Description"
                    placeholder="e.g. craving something sweet"
                    value={values.mealDescription}
                    onChangeText={handleChange('mealDescription')}
                    onBlur={handleBlur('mealDescription')}
                    errorMessage={
                      touched.mealDescription && errors.mealDescription
                        ? errors.mealDescription
                        : ''
                    }
                  />

                  {/* Portion Size */}
                  <AppInput
                    title="Portion Size"
                    placeholder="e.g. small, medium, large"
                    value={values.portionSize}
                    onChangeText={handleChange('portionSize')}
                    onBlur={handleBlur('portionSize')}
                    errorMessage={
                      touched.portionSize && errors.portionSize
                        ? errors.portionSize
                        : ''
                    }
                  />

                  <View style={styles.modalButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setModalVisible(false)}>
                      <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.submitButton}
                      onPress={handleSubmit}>
                      <Text style={styles.submitText}>Get Suggestion</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </Formik>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default WhatToEat;
