angular.module('jmt.otp', [])
  .controller('OtpRequestController', function ($scope, $rootScope, $ionicPopup, $state, Api, $ionicLoading, $cordovaDevice, $ionicPlatform) {
    $scope.error = "";
    $scope.device_object = {};

    $ionicPlatform.ready(function () {
      //if (window.cordova) {
      //console.info("$cordovaDevice.getDevice()", $cordovaDevice.getDevice());
      if (window.cordova && $cordovaDevice && $cordovaDevice.getDevice()) {
        var device_object = $cordovaDevice.getDevice();
        console.log('$cordovaDevice.getDevice()', device_object);

        $scope.device_object = {
          available: device_object.available,
          cordova: device_object.cordova,
          isVirtual: device_object.isVirtual,
          manufacturer: device_object.manufacturer,
          model: device_object.model,
          platform: device_object.platform,
          serial: device_object.serial,
          uuid: device_object.uuid,
          version: device_object.version
        };
      }
      //}
    });

    $scope.requestOTP = function () {
      console.info("requestOTP", $scope.phone_number, $scope.account_id);
      if (isEmpty($scope.phone_number)) {
        // $ionicPopup.alert({
        //   title: "JFintech",
        //   template: 'กรุณากรอกหมายเลขโทรศัพท์มือถือของท่าน'
        // });
        $scope.error = "ข้อมูลผิด กรุณาลองใหม่อีกครั้ง";
        return false;
      }

      var mobilePattern = new RegExp("[0-9]{8,10}");
      if (!mobilePattern.test($scope.phone_number)) {
        // $ionicPopup.alert({
        //   title: "JFintech",
        //   template: 'หมายเลขโทรศัพท์มือถือไม่ถูกต้อง กรุณาตรวจสอบ'
        // });
        $scope.error = "ข้อมูลผิด กรุณาลองใหม่อีกครั้ง";
        return false;
      }

      if (isEmpty($scope.account_id)) {
        // $ionicPopup.alert({
        //   title: "JFintech",
        //   template: 'กรุณากรอกหมายเลขสมาชิกของท่าน'
        // });
        $scope.error = "ข้อมูลผิด กรุณาลองใหม่อีกครั้ง";
        return false;
      }

      if (isEmpty($rootScope.endpoint_code)) {
        $rootScope.endpoint_code = md5(Math.random().toString(36).substring(7));
      }

      Api.post('jmt/otp/request', {
        device_id: $rootScope.endpoint_code,
        account_id: $scope.account_id,
        phone_number: $scope.phone_number,
        device: $scope.device_object
      }).then(function (response) {
        console.info('otp/request response', response);

        if (response.success) {
          $scope.error = "";
          $rootScope.account_id = $scope.account_id;
          $state.go("otp.verify");
        } else {
          $ionicPopup.alert({
            title: "JFintech",
            template: response.message
          });
        }
      }, function (error) {
        console.warn(error);
        $scope.error = "ข้อมูลผิด กรุณาลองใหม่อีกครั้ง";
        $scope.mainForm.$invalid = true;
        $scope.mainForm.phone_number.$invalid = true;
        $scope.mainForm.account_id.$invalid = true;
        return false;
      }).finally(function () {
        $ionicLoading.hide();
      });

      // $ionicPopup.alert({
      //   title: "JFintech",
      //   template: 'For debug purpose, please use code <strong>"' +  $rootScope.otp_check + '"</strong> for OTP Verification.'
      // }).then(function () {
      //   $scope.error = "";
      //   $state.go("otp.verify");
      // });
    };
  })

  .controller('OtpVerifyController', function ($scope, $rootScope, $state, $ionicPopup, Api, $filter, localStorageService) {
    $scope.error = "";

    $scope.verifyOTP = function () {
      if (typeof $scope.otp_number === 'undefined') {
        // $ionicPopup.alert({
        //   title: "JFintech",
        //   template: 'Please enter OTP code before submitting.'
        // });
        $scope.error = "กรุณากรอกรหัส OTP <br/>ก่อนกดยืนยัน";
        return false;
      }

      var otpPattern = new RegExp("[0-9]{6}");
      console.info("$scope.otp_number", $scope.otp_number);
      if (isEmpty($scope.otp_number) || !otpPattern.test($scope.otp_number)) {
        $scope.error = "รหัสผิด กรุณาลองใหม่อีกครั้ง";
        $scope.mainForm.$invalid = true;
        return false;
      }

      var parsed_otp_number = $filter('str_pad')($scope.otp_number, "0", 6);

      Api.post('jmt/otp/verify', {
        account_id: $rootScope.account_id,
        otp_number: parsed_otp_number
      }).then(function (response) {
        console.info(response);
        if (response && response.success) {
          $rootScope.endpoint_id = response.endpoint_id;
          $rootScope.endpoint_token = response.endpoint_token;
          $rootScope.customer_id = response.customer_id;

          localStorageService.set('endpoint_id', response.endpoint_id);
          localStorageService.set('endpoint_token', response.endpoint_token);
          localStorageService.set('customer_id', response.customer_id);

          $state.go("otp.password_setup");
          return true;
        } else {
          $scope.error = response.message || "รหัสผิด กรุณาลองใหม่อีกครั้ง";
          $scope.mainForm.$invalid = true;
          $scope.otp_number = "";
          return false;
        }
      }, function (error) {
        console.warn(error);
        $scope.error = "รหัสผิด กรุณาลองใหม่อีกครั้ง";
        $scope.mainForm.$invalid = true;
        $scope.otp_number = "";
        return false;
      });
    };
  })

  .controller('PasswordSetupController', function ($scope, $rootScope, $state, $ionicPopup, $ionicLoading, localStorageService, $filter, AppDebug) {
    if (isEmpty($rootScope.endpoint_id)) {
      $rootScope.endpoint_id = localStorageService.get('endpoint_id');
    }
    if (isEmpty($rootScope.endpoint_token)) {
      $rootScope.endpoint_token = localStorageService.get('endpoint_token');
    }
    if (isEmpty($rootScope.customer_id)) {
      $rootScope.customer_id = localStorageService.get('customer_id');
    }

    if (isEmpty($rootScope.endpoint_id)) {
      $ionicPopup.alert({
        title: "JFintech",
        template: 'Your previous OTP request session has expired. Please try again.'
      }).then(function () {
        $state.go("otp.request");
      });
      return;
    }

    $scope.setupPassword = function () {
      if (isEmpty($scope.new_password)) {
        $ionicPopup.alert({
          title: "JFintech",
          template: 'Please enter New Password before submitting.'
        });
        return false;
      }

      if (isEmpty($scope.retype_password)) {
        $ionicPopup.alert({
          title: "JFintech",
          template: 'Please enter Re-type Password before submitting.'
        });
        return false;
      }

      if (!angular.equals($scope.new_password, $scope.retype_password)) {
        $ionicPopup.alert({
          title: "JFintech",
          template: 'New Password and Re-type Password is not match. Please check them again.'
        });
        return false;
      }

      $rootScope.savePasscode($scope.new_password);

      //$ionicLoading.show({
      //  template: '<ion-spinner icon="lines" class="spinner-light"></ion-spinner>',
      //  duration: 2 * 1000
      //}).then(function(){
      //  var parsed_password = $filter('str_pad')($scope.new_password, "0", 6);
      //
      //  var tokenHash = md5($rootScope.endpoint_token + parsed_password);
      //  localStorageService.set('token_hash', tokenHash);
      //  console.info($rootScope.endpoint_token, parsed_password);
      //  var encrypted_endpoint_token = CryptoJS.AES.encrypt($rootScope.endpoint_token, parsed_password);
      //  var encrypted_endpoint_id = CryptoJS.AES.encrypt($rootScope.endpoint_id + "", parsed_password);
      //  var encrypted_customer_id = CryptoJS.AES.encrypt($rootScope.customer_id + "", parsed_password);
      //
      //  console.info("CryptoJS.AES.encrypt($rootScope.endpoint_token, parsed_password)", encrypted_endpoint_token.toString());
      //  var bytes = CryptoJS.AES.decrypt(encrypted_endpoint_token.toString(), parsed_password);
      //  var plaintext = bytes.toString(CryptoJS.enc.Utf8);
      //  console.info("CryptoJS.AES.decrypt(encrypted_endpoint_token.toString(), parsed_password)", plaintext);
      //  localStorageService.set('encrypted_endpoint_token', encrypted_endpoint_token.toString());
      //  localStorageService.set('encrypted_endpoint_id', encrypted_endpoint_id.toString());
      //  localStorageService.set('encrypted_customer_id', encrypted_customer_id.toString());
      //
      //  if(!AppDebug){
      //    localStorageService.remove('endpoint_id', 'endpoint_token', 'customer_id');
      //  }
      //
      //  $state.go("app.pincode");
      //});
    };
  });
