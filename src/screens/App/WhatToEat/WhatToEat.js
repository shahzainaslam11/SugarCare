import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  Header,
  MedicalDisclaimer,
  SmallLoader,
  AIConsentModal,
} from '../../../components';
import {useNavigation} from '@react-navigation/native';
import {useAIConsentGate} from '../../../hooks/useAIConsentGate';
import {useDispatch, useSelector} from 'react-redux';
import LinearGradient from 'react-native-linear-gradient';
import {appImages, colors} from '../../../utilities';
import styles from './styles';
import {fetchMealHistory} from '../../../redux/slices/mealRecommendationsSlice';
import PersonalizeMealModal from './PersonalizeMealModal';

const MEAL_TABS = [
  {id: 'breakfast', label: 'Breakfast'},
  {id: 'lunch', label: 'Lunch'},
  {id: 'dinner', label: 'Dinner'},
  {id: 'snacks', label: 'Snacks'},
];

const WhatToEat = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {gateAIAction, showModal, handleAccept, handleDecline} =
    useAIConsentGate();

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
  const [isOpeningModal, setIsOpeningModal] = useState(false);

  // AI consent first, then open form modal (delay lets AI modal close before opening form)
  const handleOpenPersonalizeModal = async () => {
    if (isSubmitting || isOpeningModal) return;
    setIsOpeningModal(true);
    try {
      const ok = await gateAIAction();
      if (ok) {
        setTimeout(() => setModalVisible(true), 350);
      }
    } finally {
      setIsOpeningModal(false);
    }
  };

  console.log('currentMeal', JSON.stringify(currentMeal));

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

  const handleClosePersonalizeModal = useCallback(() => {
    if (!isSubmitting) {
      setModalVisible(false);
    }
  }, [isSubmitting]);

  const handlePersonalizeBeginSubmit = useCallback(() => {
    setIsSubmitting(true);
    setModalVisible(false);
  }, []);

  const handlePersonalizeFinishSubmit = useCallback(() => {
    setIsSubmitting(false);
  }, []);

  const handlePersonalizeSuccess = useCallback(result => {
    setApiRecommendations(result);
  }, []);

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

      {/* Personalize Button - AI consent first, then form modal (no blocking) */}
      <View style={styles.personalizeContainer}>
        <TouchableOpacity
          style={styles.personalizeButton}
          onPress={handleOpenPersonalizeModal}
          disabled={isSubmitting || isOpeningModal}>
          <Text style={styles.personalizeText}>
            {isOpeningModal
              ? 'Please wait...'
              : isSubmitting
              ? 'Processing...'
              : 'Get Personalize My Meal'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Meal Type Tabs - horizontal scroll, explicit labels */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mealTypeScrollContent}
        style={styles.mealTypeScroll}>
        {MEAL_TABS.map(({id, label}) => {
          const isActive = activeMealType === id;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.mealTypeButton, isActive && styles.activeButton]}
              onPress={() => setActiveMealType(id)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.mealTypeText,
                  isActive && styles.mealTypeTextActive,
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading && !apiRecommendations && !isSubmitting ? (
          <SmallLoader />
        ) : error && !apiRecommendations ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}

        {/* Suggested Meal Section */}
        {currentMeal ? (
          <View style={styles.suggestedMealSection}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Suggested Meal</Text>
            </View>
            <TouchableOpacity
              style={styles.mealCard}
              onPress={() => handleMealPress(currentMeal)}
              activeOpacity={0.85}>
              <View style={styles.mealImageContainer}>
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
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.4)']}
                  style={styles.mealImageGradient}
                />
                <View style={styles.mealBadge}>
                  <Text style={styles.mealBadgeText}>Suggested</Text>
                </View>
              </View>
              <View style={styles.mealCardContent}>
                <Text style={styles.mealName}>{currentMeal.name}</Text>
                <Text style={styles.mealDescription}>
                  {currentMeal.description ||
                    'A healthy and balanced option for you.'}
                </Text>
              </View>
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
            <View style={styles.sectionHeader}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>Healthier Alternatives</Text>
            </View>
            {alternativeMeals.map((alternative, index) => (
              <TouchableOpacity
                key={index}
                style={styles.alternativeCard}
                onPress={() => handleMealPress(alternative)}
                activeOpacity={0.85}>
                <View style={styles.alternativeAccent} />
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
                  <Text style={styles.alternativeHint}>Tap to view recipe</Text>
                </View>
                <Text style={styles.alternativeChevron}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.disclaimerContainer}>
          <MedicalDisclaimer />
        </View>
      </ScrollView>

      <PersonalizeMealModal
        isVisible={modalVisible}
        onClose={handleClosePersonalizeModal}
        onBeginSubmit={handlePersonalizeBeginSubmit}
        onFinishSubmit={handlePersonalizeFinishSubmit}
        onSuccess={handlePersonalizeSuccess}
      />

      {isSubmitting && (
        <View style={styles.fullScreenLoaderOverlay}>
          <View style={styles.fullScreenLoaderCard}>
            <View style={styles.loaderAccentDot} />
            <ActivityIndicator size="large" color={colors.p1} />
            <Text style={styles.fullScreenLoaderText}>
              Generating personalized meal suggestions...
            </Text>
            <Text style={styles.fullScreenLoaderSubText}>
              Please wait while AI prepares your recommendations.
            </Text>
          </View>
        </View>
      )}

      <AIConsentModal
        visible={showModal}
        onAccept={handleAccept}
        onDecline={handleDecline}
      />
    </SafeAreaView>
  );
};

export default WhatToEat;
