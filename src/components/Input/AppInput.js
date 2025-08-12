import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Input} from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import {colors, family, size, WP} from '../../utilities';

const AppInput = ({
  title,
  placeholder,
  value,
  onChangeText,
  errorMessage,
  editable = true,
  secureTextEntry = false,
  keyboardType = 'default',
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  return (
    <View style={styles.mainContainer}>
      {title ? <Text style={styles.textStyle}>{title}</Text> : null}

      <Input
        placeholder={placeholder}
        placeholderTextColor={colors.g3}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        secureTextEntry={secureTextEntry && !isPasswordVisible}
        keyboardType={keyboardType}
        containerStyle={styles.inputContainer}
        inputContainerStyle={styles.inputInner}
        inputStyle={styles.inputText}
        rightIcon={
          secureTextEntry ? (
            <TouchableOpacity
              style={styles.iconTouchable}
              onPress={() => setIsPasswordVisible(prev => !prev)}>
              <Ionicons
                name={isPasswordVisible ? 'eye-off' : 'eye'}
                size={20}
                color={colors.g3}
              />
            </TouchableOpacity>
          ) : (
            <View style={{width: 20}} /> // keeps height consistent
          )
        }
        rightIconContainerStyle={styles.iconContainer}
        errorMessage={errorMessage}
        errorStyle={styles.errorTxtStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {},
  textStyle: {
    color: colors.g1,
    fontFamily: family.inter_medium,
    fontSize: size.medium,
  },
  inputContainer: {
    paddingHorizontal: 0,
  },
  inputInner: {
    borderWidth: 1,
    borderColor: '#E3E3E3',
    borderRadius: 12,
    paddingHorizontal: WP('2'),
    backgroundColor: colors.white,
    height: 48, // fixed height for all inputs
  },
  inputText: {
    color: colors.black,
    paddingVertical: 0, // prevents extra height issues
  },
  iconTouchable: {
    padding: 0,
    margin: 0,
  },
  iconContainer: {
    padding: 0,
    margin: 0,
  },
  errorTxtStyle: {
    color: colors.r1,
    fontSize: size.tiny,
    fontFamily: family.inter_medium,
  },
});

AppInput.propTypes = {
  title: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChangeText: PropTypes.func,
  errorMessage: PropTypes.string,
  editable: PropTypes.bool,
  secureTextEntry: PropTypes.bool,
  keyboardType: PropTypes.string,
};

export {AppInput};
