import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Header, AppInput, SmallLoader} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useDispatch, useSelector} from 'react-redux';
import {appImages} from '../../../utilities';
import styles from './styles';
import {
  generateMealRecommendations,
  fetchMealHistory,
} from '../../../redux/slices/mealRecommendationsSlice';

const WhatToEat = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const {accessToken, user} = useSelector(state => state.auth);
  const {recommendations, history, loading, error} = useSelector(
    state => state.meals,
  );
  console.log('recommendations0---->', JSON.stringify(recommendations));

  const [activeMealType, setActiveMealType] = useState('breakfast');
  const [modalVisible, setModalVisible] = useState(false);
  const [currentMeal, setCurrentMeal] = useState(null);
  const [apiRecommendations, setApiRecommendations] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  console.log('currentMeal', JSON.stringify(currentMeal));

  // Validation schema
  const validationSchema = Yup.object().shape({
    currentGlucose: Yup.number()
      .typeError('Must be a valid number')
      .positive('Glucose must be positive')
      .min(50, 'Value too low')
      .max(400, 'Value too high')
      .required('Current glucose is required'),

    diabetesControlLevel: Yup.string()
      .trim()
      .required('Diabetes control level is required')
      .oneOf(
        ['Well controlled', 'Moderately controlled', 'Poorly controlled'],
        'Must be: Well controlled, Moderately controlled, or Poorly controlled',
      ),

    mealDescription: Yup.string()
      .trim()
      .required('Meal description is required')
      .min(3, 'Description too short (min 3 characters)')
      .max(100, 'Description too long (max 100 characters)'),

    portionSize: Yup.string()
      .trim()
      .required('Portion size is required')
      .oneOf(['Light', 'Medium', 'Large'], 'Must be Light, Medium, or Large'),
  });

  // Fetch meal history on mount
  useEffect(() => {
    if (accessToken && user?.id) {
      dispatch(
        fetchMealHistory({
          user_id: user.id,
          token: accessToken,
        }),
      );
    }
  }, [accessToken, user?.id, dispatch]);

  // Extract and set API recommendations from state or history
  useEffect(() => {
    if (recommendations) {
      console.log('Using recommendations from state:', recommendations);
      setApiRecommendations(recommendations);
    } else if (history?.length > 0) {
      const lastHistory = history[history.length - 1];
      const recs = lastHistory.response_json?.recommendations || null;
      console.log('Extracted recommendations from history:', recs);
      setApiRecommendations(recs);
    } else {
      setApiRecommendations(null);
    }
  }, [recommendations, history]);

  // Update current meal when apiRecommendations or activeMealType changes
  useEffect(() => {
    if (apiRecommendations && apiRecommendations[activeMealType]) {
      const meals = apiRecommendations[activeMealType];
      if (meals.length > 0) {
        const newMeal =
          meals.find(meal => meal.name !== currentMeal?.name) || meals[0];
        setCurrentMeal(newMeal);
      } else {
        setCurrentMeal(null);
      }
    } else {
      setCurrentMeal(null);
    }
  }, [apiRecommendations, activeMealType]);

  // Handle form submission
  const handleFormSubmit = async (values, {resetForm}) => {
    if (!user?.id) {
      Alert.alert('Error', 'User information not available');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      current_glucose: Number(values.currentGlucose),
      diabetes_control_level: values.diabetesControlLevel,
      meal_description: values.mealDescription.trim(),
      portion_size: values.portionSize.trim(),
      time: new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
      user_id: user.id,
    };

    console.log('Submitting payload to API:', payload);

    try {
      const result = await dispatch(
        generateMealRecommendations({
          payload,
          token: accessToken,
        }),
      ).unwrap();

      console.log('API success response:', result);

      if (result) {
        setApiRecommendations(result);
        resetForm();
        setModalVisible(false);

        Alert.alert('Success', 'Meal recommendations generated successfully!');
      }
    } catch (error) {
      console.error('API error:', error);

      let errorMessage = 'Failed to generate meal recommendations';

      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get meals for active type
  const apiMeals = apiRecommendations?.[activeMealType] || [];

  // Get alternative meals (all meals except current)
  const alternativeMeals =
    apiMeals.filter(meal => meal.name !== currentMeal?.name) || [];

  // Handle meal card press - Navigate to RecipeDetail
  const handleMealPress = meal => {
    if (meal && apiRecommendations) {
      navigation.navigate('Recipe', {
        meal: meal,
        mealType: activeMealType,
        allMeals: apiMeals,
        userData: {
          userId: user?.id,
          userName: user?.name,
          diabetesType: user?.diabetes_type,
        },
        recommendationsData: apiRecommendations,
      });
    } else {
      Alert.alert('No Meal', 'Please generate a personalized meal first.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="What to Eat?" onPress={() => navigation.goBack()} />

      {/* Personalize Button */}
      <View style={styles.personalizeContainer}>
        <TouchableOpacity
          style={styles.personalizeButton}
          onPress={() => setModalVisible(true)}
          disabled={isSubmitting}>
          <Text style={styles.personalizeText}>
            {isSubmitting ? 'Processing...' : 'Get Personalize My Meal'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Meal Type Tabs */}
      <View style={styles.mealTypeContainer}>
        {['breakfast', 'lunch', 'dinner', 'snacks'].map(type => (
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
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && !apiRecommendations ? (
          <SmallLoader />
        ) : error && !apiRecommendations ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {/* Suggested Meal Section */}
        {currentMeal ? (
          <View style={styles.suggestedMealSection}>
            <Text style={styles.sectionTitle}>Suggested Meal</Text>
            <TouchableOpacity
              style={styles.mealCard}
              onPress={() => handleMealPress(currentMeal)}
              activeOpacity={0.8}>
              <Image
                source={
                  currentMeal.image_url
                    ? {uri: currentMeal.image_url}
                    : appImages.p11
                }
                style={styles.mealImage}
                resizeMode="cover"
                defaultSource={appImages.p11}
              />
              <Text style={styles.mealName}>{currentMeal.name}</Text>
              <Text style={styles.mealDescription}>
                {currentMeal.description ||
                  'A healthy and balanced option for you.'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : apiRecommendations ? (
          <View style={styles.noMealContainer}>
            <Text style={styles.noMealText}>
              No meals available for {activeMealType}.
            </Text>
            <Text style={styles.noMealSubtext}>
              Try selecting a different meal type.
            </Text>
          </View>
        ) : (
          <View style={styles.noMealContainer}>
            <Text style={styles.noMealText}>No personalized meals yet.</Text>
            <Text style={styles.noMealSubtext}>
              Click "Get Personalize My Meal" to get recommendations.
            </Text>
          </View>
        )}

        {/* Healthier Alternatives Section */}
        {alternativeMeals.length > 0 && (
          <View style={styles.alternativesSection}>
            <Text style={styles.sectionTitle}>Healthier Alternatives</Text>
            {alternativeMeals.map((alternative, index) => (
              <TouchableOpacity
                key={index}
                style={styles.alternativeCard}
                onPress={() => handleMealPress(alternative)}
                activeOpacity={0.8}>
                <Image
                  source={
                    alternative.image_url
                      ? {uri: alternative.image_url}
                      : index % 2 === 0
                      ? appImages.p1
                      : appImages.p2
                  }
                  style={styles.alternativeImage}
                  resizeMode="cover"
                  defaultSource={index % 2 === 0 ? appImages.p1 : appImages.p2}
                />
                <View style={styles.alternativeText}>
                  <Text style={styles.alternativeName}>{alternative.name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Personalization Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => !isSubmitting && setModalVisible(false)}>
        <KeyboardAvoidingView
          style={{flex: 1}}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Personalize Your Meal</Text>
                {!isSubmitting && (
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>×</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Formik
                initialValues={{
                  currentGlucose: '',
                  diabetesControlLevel: 'Moderately controlled',
                  mealDescription: '',
                  portionSize: 'Medium',
                }}
                validationSchema={validationSchema}
                onSubmit={handleFormSubmit}>
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isValid,
                  dirty,
                  setFieldValue,
                }) => (
                  <ScrollView
                    style={styles.formContainer}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
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
                      editable={!isSubmitting}
                    />

                    {/* Diabetes Control Level Dropdown */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputTitle}>
                        Diabetes Control Level *
                      </Text>
                      <View style={styles.dropdownContainer}>
                        {[
                          'Well controlled',
                          'Moderately controlled',
                          'Poorly controlled',
                        ].map(option => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.dropdownOption,
                              values.diabetesControlLevel === option &&
                                styles.dropdownOptionSelected,
                            ]}
                            onPress={() =>
                              setFieldValue('diabetesControlLevel', option)
                            }
                            disabled={isSubmitting}>
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                values.diabetesControlLevel === option &&
                                  styles.dropdownOptionTextSelected,
                              ]}>
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {touched.diabetesControlLevel &&
                        errors.diabetesControlLevel && (
                          <Text style={styles.errorTextSmall}>
                            {errors.diabetesControlLevel}
                          </Text>
                        )}
                    </View>

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
                      multiline
                      numberOfLines={3}
                      editable={!isSubmitting}
                    />

                    {/* Portion Size Dropdown */}
                    <View style={styles.inputContainer}>
                      <Text style={styles.inputTitle}>Portion Size *</Text>
                      <View style={styles.dropdownContainer}>
                        {['Light', 'Medium', 'Large'].map(option => (
                          <TouchableOpacity
                            key={option}
                            style={[
                              styles.dropdownOption,
                              values.portionSize === option &&
                                styles.dropdownOptionSelected,
                            ]}
                            onPress={() => setFieldValue('portionSize', option)}
                            disabled={isSubmitting}>
                            <Text
                              style={[
                                styles.dropdownOptionText,
                                values.portionSize === option &&
                                  styles.dropdownOptionTextSelected,
                              ]}>
                              {option}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                      {touched.portionSize && errors.portionSize && (
                        <Text style={styles.errorTextSmall}>
                          {errors.portionSize}
                        </Text>
                      )}
                    </View>

                    <View style={styles.modalButtons}>
                      <TouchableOpacity
                        style={[
                          styles.cancelButton,
                          isSubmitting && styles.buttonDisabled,
                        ]}
                        onPress={() => setModalVisible(false)}
                        disabled={isSubmitting}>
                        <Text style={styles.cancelText}>Cancel</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.submitButton,
                          (!isValid || !dirty || isSubmitting) &&
                            styles.buttonDisabled,
                        ]}
                        onPress={handleSubmit}
                        disabled={!isValid || !dirty || isSubmitting}>
                        {isSubmitting ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <Text style={styles.submitText}>Get Suggestion</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                )}
              </Formik>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

export default WhatToEat;
