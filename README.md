# MOMOO React Native
WebView를 사용하여 React로 개발된 MOMOO 웹을 앱에 임베딩했습니다.
<br>
<br>
**웹사이트** [momoo.kr](momoo.kr)<br>
**플레이스토어** [바로가기](https://play.google.com/store/apps/details?id=com.momoo&hl=en-KR)
<br>
<br>

## 기능
**SafeAreaView**
- iOS 11 버전 이후부터 적용
- 아이폰 노치에 콘텐츠가 가려지지 않도록 사용
<br>
<br>

## 트러블 슈팅

### 안드로이드 기기의 뒤로가기

<details>
  <summary><strong>이전 페이지와 앱 종료</strong></summary>
  
  - **상황** : 안드로이드 사용자로부터 기기의 뒤로가기를 누르면 앱이 닫혀서 불편하다는 피드백을 받음
  - **해결**
    - 브라우저 히스토리 스택에서 상태가 변경될 때, 웹뷰 컴포넌트로 postMessage

      ```js
        // App.tsx
    
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
        
        <WebView
          injectedJavaScript={webviewJavaScript}
        />
      ```
    <br>
    
    - 웹뷰 컴포넌트에 'navigationStateChange' message가 전달되면, 웹뷰의 canGoBack 값으로 isCanGoBack 업데이트
      
      ```js
        // App.tsx
    
        const [isCanGoBack, setIsCanGoBack] = useState(false);
        
        <WebView
          onMessage={({nativeEvent: state}) => {
            if (state.data === 'navigationStateChange') {
              setIsCanGoBack(state.canGoBack);
            }
          }}
        />
      ```
    <br>
  
    - hardwareBackPress 이벤트 발생 시, isCanGoBack이 true일 경우, 앱을 종료하지 않고 이전 경로로 이동
      
      ```js
        // App.tsx
    
        const onPressHardwareBackButton = () => {
          if (webviewRef.current) {
            webviewRef.current.goBack(); // 이전 경로로 이동
            return true; // 앱 종료하지 않기
          }
    
          return false; // 앱 종료하기
        };
    
        BackHandler.addEventListener(
          'hardwareBackPress',
          onPressHardwareBackButton,
        );
      ```
</details>

<details>
  <summary><strong>화면 전체를 차지하는 모달과 이전 페이지 이동</strong></summary>
  <br>

  - **상황**
    - 화면 전체를 차지하는 모달이 열려있을 때, 뒤로가기를 누르면 모달이 닫히길 기대함
    - EditFeedModal이 열려있을 때, 뒤로가기를 누르면 '이전 페이지로 이동'하며 모달도 없어짐
    - UploadFeedModal이 열려있을 때, 뒤로가기를 누르면 '모달이 닫히지 않고 이전 페이지로 이동'함
  <br>
  
  - **원인**
    - EditFeedModal은 특정 페이지에 렌더링되기 때문에, 이전 페이지로 이동하며 모달도 없어짐
    - UploadFeedModal은 특정 페이지 컴포넌트에 속하지 않기 때문에, 이전 페이지로 이동해도 닫히지 않음
  <br>
  
  - **해결** : 뒤로가기 터치 시, 이전 페이지로 이동하지 않고 모달이 닫히도록 변경
    - **웹뷰 |** 모달 open, close 시, 네이티브로 메시지를 보낸다

      ```js
        // MOMOO-Nextjs/src/hooks/dialog/useModalWithWebView.tsx
        
          const [isModalOpen, setIsModalOpen] = useState(false);
        
          const openModal = () => {
            setIsModalOpen(true);
        
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('openModal');
            }
          };
        
          const closeModal = () => {
            setIsModalOpen(false);
        
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('closeModal');
            }
          };
      ```
    <br>
    
    - **네이티브 |** 웹뷰로부터 'openModal', 'closeModal' message를 전달받으면 isModalOpen 변경
      ```js
        // App.tsx
        
        const [isModalOpen, setIsModalOpen] = useState(false);
      
        <WebView
          onMessage={({nativeEvent: state}) => {
            switch (state.data) {
              case 'openModal':
                setIsModalOpen(true);
                break;
              case 'closeModal':
                setIsModalOpen(false);
            }
          }}
        />
      ```
    <br>

    - **네이티브 |** isModalOpen이 true일 때, 기기의 뒤로가기를 누르면 웹뷰에 'closeModal' message를 보낸다.

      ```js
        // App.tsx

        const [isModalOpen, setIsModalOpen] = useState(false);

        const onPressHardwareBackButton = () => {
          if (webviewRef.current && isModalOpen) {
            setIsModalOpen(false);
            webviewRef.current.postMessage('closeModal');
            return true;
          }
    
          return false;
        };
    
        BackHandler.addEventListener(
          'hardwareBackPress',
          onPressHardwareBackButton,
        );
      ```
    <br>
    
    - **웹뷰 |** 네이티브로부터 'closeModal' message를 전달받으면 모달을 닫는다.

      ```js
        // MOMOO-Nextjs/src/hooks/dialog/useModalWithWebView.tsx
        
        const closeModal = (e: MessageEvent) => {
          if (e.data === 'closeModal') {
            setIsModalOpen(false);
          }
        };
        window.addEventListener('message', closeModal, true);
      ```
</details>
