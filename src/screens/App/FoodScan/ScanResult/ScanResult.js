import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {AppButton, Header} from '../../../../components';
import {appIcons, colors, family, HP, size, WP} from '../../../../utilities';

const ScanResult = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Header
          title="Smart Food Scanner"
          onPress={() => navigation.goBack()}
        />

        {/* Main Content */}
        <View style={styles.content}>
          {/* Food Item with Image */}
          <View style={styles.foodSection}>
            <Image
              source={appIcons.bowl} // Replace with actual image URL or local asset
              style={styles.foodImage}
              resizeMode="cover"
            />
            <Text style={styles.foodName}>Bowl of Ramen</Text>
            <Text style={styles.calories}>(550 kcal)</Text>
          </View>

          {/* Blood Sugar Impact */}
          <View style={styles.impactSection}>
            <Text style={styles.impactTitle}>
              Predicted Impact on Blood Sugar
            </Text>

            <View style={styles.impactItem}>
              <Image
                source={appIcons.info} // Replace with your warning image
                style={styles.imageIcon}
                resizeMode="contain"
              />
              <Text style={styles.impactText}>
                May raise sugar by ~35 mg/dL in 2 hrs
              </Text>
            </View>

            <View style={styles.accuracyNote}>
              <Image
                source={appIcons.info} // Replace with your info image
                style={styles.imageIcon}
                resizeMode="contain"
              />
              <Text style={styles.accuracyText}>
                Prediction accuracy may vary based on portion size and
                ingredients.
              </Text>
            </View>
          </View>

          {/* Nutrition Facts */}
          <View style={styles.nutritionSection}>
            <Text style={styles.nutritionTitle}>
              Nutrition Facts (per portion)
            </Text>

            <View style={styles.nutritionGrid}>
              <View style={styles.nutritionItem}>
                <Image
                  source={appIcons.protien}
                  style={styles.iconStyle}
                  resizeMode="contain"
                />
                <Text style={styles.nutritionValue}>27g</Text>
                <Text style={styles.nutritionLabel}>Proteins</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Image
                  source={appIcons.carbs}
                  style={styles.iconStyle}
                  resizeMode="contain"
                />
                <Text style={styles.nutritionValue}>60g</Text>
                <Text style={styles.nutritionLabel}>Carbs</Text>
              </View>

              <View style={styles.nutritionItem}>
                <Image
                  source={appIcons.fats}
                  style={styles.iconStyle}
                  resizeMode="contain"
                />
                <Text style={styles.nutritionValue}>12g</Text>
                <Text style={styles.nutritionLabel}>Fats</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <AppButton
          title="Go Back"
          backgroundColor="#fff"
          titleStyle={{color: colors.p1}}
          onPress={() => navigation.goBack()}
          // onPress={handlePickFromGallery}
          containerStyle={{width: '48%'}}
        />
        <AppButton
          title="Scan Again"
          backgroundColor={colors.p1}
          titleStyle={{color: '#FFFFFF'}}
          containerStyle={{width: '48%'}}
          onPress={() => navigation.goBack()}

          // onPress={() => navigation.navigate('Scanner')}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  content: {
    paddingHorizontal: 20,
  },
  foodSection: {
    alignItems: 'center',
    marginVertical: 20,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
  },
  foodName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 5,
  },
  calories: {
    fontSize: 18,
    color: '#7f8c8d',
  },
  impactSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  impactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  impactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  impactText: {
    fontSize: 16,
    color: '#e74c3c',
    fontWeight: '500',
    marginLeft: 8,
  },
  accuracyNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
  },
  accuracyText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  nutritionSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  nutritionLabel: {
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  imageIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  iconStyle: {
    width: WP('6'),
    height: HP('4'),
    marginVertical: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});

export default ScanResult;
