import {Alert, Linking, Platform} from 'react-native';
import {PERMISSIONS, RESULTS, requestMultiple} from 'react-native-permissions';

class PermissionUtil {
  // 디바이스 플랫폼 체크
  cmmDevicePlatformCheck = (): boolean => {
    let isUseDevice = true;

    if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
      !isUseDevice;
    }

    return isUseDevice;
  };

  cmmReqPhotoLibraryPermission = async (): Promise<void> => {
    if (!this.cmmDevicePlatformCheck()) {
      return;
    }

    const platformPermissions =
      Platform.OS === 'ios'
        ? [PERMISSIONS.IOS.PHOTO_LIBRARY]
        : [
            PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
            PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
          ];

    try {
      // Request Permission
      const result = await requestMultiple(platformPermissions);

      console.log(result);
      if (
        result['ios.permission.PHOTO_LIBRARY'] === RESULTS.GRANTED ||
        result['android.permission.READ_EXTERNAL_STORAGE'] ===
          RESULTS.GRANTED ||
        result['android.permission.READ_MEDIA_IMAGES'] === RESULTS.GRANTED ||
        result['ios.permission.PHOTO_LIBRARY'] === RESULTS.LIMITED ||
        result['android.permission.READ_EXTERNAL_STORAGE'] ===
          RESULTS.LIMITED ||
        result['android.permission.READ_MEDIA_IMAGES'] === RESULTS.LIMITED
      ) {
        console.log('권한이 허용되었습니다');
      } else {
        Alert.alert('인생네컷을 올리기 위해 사진첩 권한을 허용해주세요', '', [
          {text: '취소', onPress: () => {}},
          {
            text: '설정',
            style: 'default',
            onPress: () => {
              Linking.openSettings();
            },
          },
        ]);
      }
    } catch (err) {
      Alert.alert('사진첩 사용 권한 요청 에러');
      console.warn(err);
    }
  };
}

export default PermissionUtil;
