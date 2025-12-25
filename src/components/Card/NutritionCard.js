// NutritionCard.js
import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import {appIcons, colors, family, HP, size, WP} from '../../utilities';

const GICarbsBox = ({title, value, status, isGI = false}) => {
  const getStatusBadgeStyle = status => {
    switch (status?.toLowerCase()) {
      case 'low':
        return styles.giStatusLow;
      case 'medium':
        return styles.giStatusMedium;
      case 'high':
        return styles.giStatusHigh;
      default:
        return styles.giStatusDefault;
    }
  };

  return (
    <View style={styles.giCarbsBoxContainer}>
      <Text style={styles.giCarbsTitle}>{title}</Text>
      {isGI ? (
        <View style={styles.giContent}>
          <Text style={styles.giCarbsValue}>{value}</Text>
          {status && (
            <View style={[styles.giStatusBadge, getStatusBadgeStyle(status)]}>
              <Text style={styles.giStatusText}>{status}</Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.giCarbsValue}>{value}</Text>
      )}
    </View>
  );
};

const NutrientFactItem = ({value, label, icon, color}) => (
  <View style={styles.nutrientFactItem}>
    <Image
      source={icon}
      style={[styles.nutrientIcon, {tintColor: color}]}
      resizeMode="contain"
    />
    <Text style={styles.nutrientFactValue}>{value}</Text>
    <Text style={styles.nutrientFactLabel}>{label}</Text>
  </View>
);

const NutritionCard = ({
  glycemicIndex,
  giStatus,
  carbohydrates,
  fatValue,
  proteinValue,
  sugarValue,
  fibreValue,
}) => (
  <View style={styles.card}>
    <Text style={styles.nutrientsFactsTitle}>Nutrients Facts:</Text>

    {/* Header Section: GI and Carbs */}
    <View style={styles.headerRow}>
      <GICarbsBox
        title="Glycemic Index:"
        value={glycemicIndex}
        status={giStatus}
        isGI={true}
      />
      <GICarbsBox title="Carbohydrates" value={carbohydrates} isGI={false} />
    </View>

    {/* Nutrient Fact Section */}
    <View style={styles.factsRow}>
      <NutrientFactItem
        value={fatValue}
        label="Fats"
        icon={appIcons.fats}
        color={colors.danger}
      />
      <NutrientFactItem
        value={proteinValue}
        label="Protein"
        icon={appIcons.protien}
        color={colors.success}
      />
      <NutrientFactItem
        value={sugarValue}
        label="Sugar"
        icon={appIcons.sugar}
        color={colors.warning} // Orange
      />
      <NutrientFactItem
        value={fibreValue}
        label="Fibre"
        icon={appIcons.carbs}
        color={colors.info} // Blue
      />
    </View>
  </View>
);

export default NutritionCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    marginVertical: HP(1),
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  // GI/Carbs Box Styles
  giCarbsBoxContainer: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.lightGrayBackground,
    flex: 1,
    marginHorizontal: 5,
  },
  giCarbsTitle: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.b1,
    fontWeight: '800',
    marginBottom: HP(0.5),
  },
  giCarbsValue: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.black,
  },
  giContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  giStatusBadge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  giStatusText: {
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    color: colors.white,
    fontWeight: '600',
  },
  giStatusLow: {
    backgroundColor: colors.primary,
  },
  giStatusMedium: {
    backgroundColor: colors.warning,
  },
  giStatusHigh: {
    backgroundColor: colors.danger,
  },

  // Nutrient Facts Styles
  factsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  nutrientFactItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: WP(3),
    marginHorizontal: 4,
    borderColor: colors.lightGrayBackground,
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  nutrientIcon: {
    width: WP(6),
    height: HP(4),
    marginBottom: 5,
  },
  nutrientFactValue: {
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    fontWeight: '700',
    color: colors.black,
    lineHeight: 22,
  },
  nutrientFactLabel: {
    fontSize: size.small,
    fontFamily: family.inter_medium,
    color: colors.b1,
    fontWeight: '500',
    textAlign: 'center',
  },
  nutrientsFactsTitle: {
    fontSize: size.normal,
    fontFamily: family.inter_medium,
    fontWeight: '800',
    incolor: colors.black,
    marginBottom: 10,
  },
});
