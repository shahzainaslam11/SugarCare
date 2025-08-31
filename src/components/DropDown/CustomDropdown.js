// components/common/CustomDropdown.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import PropTypes from 'prop-types';
import {colors, family, HP, size, WP} from '../../utilities';

const CustomDropdown = ({
  title,
  open,
  setOpen,
  value,
  setValue,
  items,
  setItems,
  placeholder,
  errorMessage,
  onChangeValue, // <-- NEW (optional, to sync with Formik)
}) => {
  return (
    <View style={styles.mainContainer}>
      {/* Title */}
      {title ? <Text style={styles.textStyle}>{title}</Text> : null}

      {/* Dropdown */}
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder={placeholder}
        placeholderStyle={{color: colors.g3}}
        style={[
          styles.dropdown,
          errorMessage ? {borderColor: colors.r1} : null, // highlight red when error
        ]}
        dropDownContainerStyle={styles.dropdownContainer}
        textStyle={styles.dropdownText}
        onChangeValue={val => {
          setValue(val);
          if (onChangeValue) onChangeValue(val); // notify parent (Formik)
        }}
      />

      {/* Error Message */}
      {errorMessage ? (
        <Text style={styles.errorTxtStyle}>{errorMessage}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    // marginBottom: WP('10'),
  },
  textStyle: {
    color: colors.g1,
    fontFamily: family.inter_medium,
    fontSize: size.medium,
    marginBottom: HP('1'),
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 12,
    backgroundColor: colors.white,
    height: HP('5'), // 👈 fixed height (same as your inputs)
    minHeight: HP('5'),
    paddingHorizontal: WP('3'),
    marginBottom: HP('2.5'),
  },
  dropdownContainer: {
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 12,
    backgroundColor: colors.white,
  },
  dropdownText: {
    color: colors.black,
    fontFamily: family.inter_medium,
    fontSize: size.normal,
    textAlignVertical: 'center', // 👈 aligns text vertically
  },
  errorTxtStyle: {
    color: colors.r1,
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
    marginTop: WP('1'),
  },
});

CustomDropdown.propTypes = {
  title: PropTypes.string,
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  value: PropTypes.any,
  setValue: PropTypes.func.isRequired,
  items: PropTypes.array.isRequired,
  setItems: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  errorMessage: PropTypes.string,
  onChangeValue: PropTypes.func, // new
};

export {CustomDropdown};
