import {Alert, Linking, Platform} from 'react-native';
import {
  PERMISSIONS,
  RESULTS,
  request,
  requestMultiple,
} from 'react-native-permissions';

class PermissionUtil {
  alertPermission = () => {
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
  };

  reqAndroidPermission = async () => {
    try {
      const result = await requestMultiple([
        PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
        PERMISSIONS.ANDROID.READ_MEDIA_IMAGES,
      ]);
      if (
        result['android.permission.READ_EXTERNAL_STORAGE'] ===
          RESULTS.UNAVAILABLE &&
        result['android.permission.READ_MEDIA_IMAGES'] === RESULTS.UNAVAILABLE
      ) {
        return;
      }

      if (
        result['android.permission.READ_EXTERNAL_STORAGE'] !==
          RESULTS.GRANTED &&
        result['android.permission.READ_MEDIA_IMAGES'] !== RESULTS.GRANTED
      ) {
        this.alertPermission();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  reqIosPermission = async () => {
    try {
      const result = await request(PERMISSIONS.IOS.PHOTO_LIBRARY);

      if (result === RESULTS.BLOCKED) {
        this.alertPermission();
      }
    } catch (err) {
      console.warn(err);
    }
  };

  handlePermissionToUploadPhoto = async () => {
    switch (Platform.OS) {
      case 'ios':
        this.reqIosPermission();
        break;
      case 'android':
        this.reqAndroidPermission();
    }
  };
}

export default PermissionUtil;
