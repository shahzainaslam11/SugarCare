import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {Input} from 'react-native-elements';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PropTypes from 'prop-types';
import {colors, family, HP, size, WP} from '../../utilities';

const AppInput = ({
  title,
  placeholder,
  value,
  onChangeText,
  errorMessage,
  editable = true,
  secureTextEntry = false,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  multilineMaxHeight,
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
        multiline={multiline}
        numberOfLines={multiline ? numberOfLines : 1}
        containerStyle={styles.inputContainer}
        inputContainerStyle={[
          styles.inputInner,
          multiline && styles.inputInnerMultiline,
          multiline &&
            multilineMaxHeight != null && {
              maxHeight: multilineMaxHeight,
            },
        ]}
        inputStyle={styles.inputText}
        textAlignVertical={multiline ? 'top' : 'center'}
        scrollEnabled={multiline ? true : undefined}
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
  mainContainer: {
    marginVertical: HP('0.5'),
  },
  textStyle: {
    color: colors.g1,
    fontFamily: family.inter_medium,
    fontSize: size.medium,
    marginVerticalL: HP('1'),
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
    minHeight: HP(5), // minimum height for all inputs
  },
  inputInnerMultiline: {
    minHeight: HP(5),
    paddingVertical: HP('1'),
    alignItems: 'flex-start', // Align text to top for multiline
  },
  inputText: {
    color: colors.g1,
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
  multiline: PropTypes.bool,
  numberOfLines: PropTypes.number,
  multilineMaxHeight: PropTypes.number,
};

export {AppInput};
