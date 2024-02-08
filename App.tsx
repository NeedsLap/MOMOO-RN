import React, {useRef, useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {BackHandler} from 'react-native';
import WebView from 'react-native-webview';

export default function App(): JSX.Element {
  const webview = useRef<WebView<{}>>();
  const [isCanGoBack, setIsCanGoBack] = useState(false);

  const onPressHardwareBackButton = () => {
    if (webview.current && isCanGoBack) {
      webview.current.goBack();
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    BackHandler.addEventListener(
      'hardwareBackPress',
      onPressHardwareBackButton,
    );

    return () => {
      BackHandler.removeEventListener(
        'hardwareBackPress',
        onPressHardwareBackButton,
      );
    };
  }, [isCanGoBack]);

  const webviewJavaScript = `
    const wrap = (fn) => {
      return function() {
        window.ReactNativeWebView.postMessage('navigationStateChange');
        return fn.apply(this, arguments);
      }
    }

    history.pushState = wrap(history.pushState);
    history.replaceState = wrap(history.replaceState);
    
    window.addEventListener('popstate', () => {
      window.ReactNativeWebView.postMessage('navigationStateChange');
    });
  `;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={node => {
          if (node) {
            webview.current = node;
          }
        }}
        source={{
          uri: 'https://momoo-e22ab.web.app/',
        }}
        injectedJavaScript={webviewJavaScript}
        onMessage={({nativeEvent: state}) => {
          if (state.data === 'navigationStateChange') {
            setIsCanGoBack(state.canGoBack);
          }
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
