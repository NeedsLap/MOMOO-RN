import React, {useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import WebView from 'react-native-webview';
import PermissionUtil from './utils';

function App(): JSX.Element {
  useEffect(() => {
    const permisionUtil = new PermissionUtil();
    permisionUtil.handlePermissionToUploadPhoto();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <WebView source={{uri: 'https://momoo-e22ab.web.app/'}} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
