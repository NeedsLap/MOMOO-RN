import React, {useRef, useState, useEffect} from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import {BackHandler} from 'react-native';
import WebView from 'react-native-webview';

export default function App(): JSX.Element {
  const webviewRef = useRef<WebView<{}> | null>(null);
  const [isCanGoBack, setIsCanGoBack] = useState(false);

  const onPressHardwareBackButton = () => {
    if (webviewRef.current) {
      webviewRef.current.goBack();
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (!isCanGoBack) return;

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
        let res = fn.apply(this, arguments);
        window.ReactNativeWebView.postMessage('navigationStateChange');
        return res;
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
        ref={webviewRef}
        source={{
          uri: 'https://momoo.kr/',
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
