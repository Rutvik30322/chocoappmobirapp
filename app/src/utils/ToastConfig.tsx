import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

// Define custom toast config
const toastConfig = {
  /*
    Overwrite 'success' type,
    NOTE: Only pass the BaseToast component here if you want to overwrite the whole component.
  */
  success: (props: any) => (
    <BaseToast
      {...props}
      style={[styles.base, styles.success]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
    />
  ),

  error: (props: any) => (
    <ErrorToast
      {...props}
      style={[styles.base, styles.error]}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text1NumberOfLines={1}
      text2NumberOfLines={2}
    />
  ),

  /*
    Or create a completely new type
  */
  custom_toast: (props: any) => (
    <View style={[styles.base, styles.custom]}>
      <Text style={styles.text1}>{props.text1}</Text>
      <Text style={styles.text2} numberOfLines={2}>
        {props.text2}
      </Text>
    </View>
  )
};

const styles = StyleSheet.create({
  base: {
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    marginHorizontal: 20,
    marginVertical: 10,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  success: {
    borderLeftColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  error: {
    borderLeftColor: '#F44336',
    backgroundColor: '#F44336',
  },
  custom: {
    borderLeftColor: '#FF9800',
    backgroundColor: '#FF9800',
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  text2: {
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 5,
  },
});

export default toastConfig;