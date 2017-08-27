angular.module('jmt', [
  'ionic', 'ngCordova', 'LocalStorageModule', 'angularMoment', 'td.barcode', 'ui.mask',
  'monospaced.qrcode', 'ngclipboard', 'io-barcode', 'ngMap', 'angular-svg-round-progressbar',
  'jmt.config', 'jmt.routes', 'jmt.filters', 'jmt.directives', 'jmt.services', 'jmt.controllers',
  'jmt.api', 'jmt.home', 'jmt.settings', 'jmt.profile', 'jmt.otp', 'jmt.loan',
  'jmt.payment', 'jmt.promotion', 'jmt.store', 'jmt.application', 'jmt.pincode'
])
  .config(function (localStorageServiceProvider) {
    console.warn("localStorageServiceProvider.setPrefix");
    localStorageServiceProvider
      .setPrefix('jmt');
    // $ionicCloudProvider.init({
    // 	"core": {
    // 		"app_id": "061d5a1a"
    // 	},
    // 	"push": {
    // 		"sender_id": "604169745411",
    // 		"pluginConfig": {
    // 			"ios": {
    // 				"badge": true,
    // 				"sound": true
    // 			},
    // 			"android": {
    // 				"iconColor": "#343434"
    // 			}
    // 		}
    // 	}
    // });
  })
  .run(function ($ionicPlatform, $ionicLoading, $ionicHistory, $ionicPopup, $cordovaDevice, $rootScope, $timeout,
                 moment, localStorageService, $state, ApiConfig, AppDebug, AppEnv, $http, $filter, amMoment, $q) {
    amMoment.changeLocale('th');

    if (AppDebug) {
      console.warn("====================== ENTER DEBUG MODE ======================");
      $rootScope.environment = "debug";
      localStorageService.set('environment', 'debug');
      $rootScope.api_endpoint = ApiConfig.api_endpoint;
      localStorageService.bind($rootScope, 'is_login');
      if ($rootScope.is_login === undefined || $rootScope.is_login === "undefined") {
        $rootScope.is_login = false;
      } else if ($rootScope.is_login === "true") {
        $rootScope.is_login = true;
      } else if ($rootScope.is_login === "false") {
        $rootScope.is_login = false;
      } else {
        $rootScope.is_login = !!($rootScope.is_login);
      }

      if ($rootScope.is_login) {
        $rootScope.endpoint_token = localStorageService.get('endpoint_token');
        $rootScope.endpoint_id = localStorageService.get('endpoint_id');
        $rootScope.customer_id = parseInt(localStorageService.get('customer_id'));

        console.warn("========================= START AUTO LOGIN =========================");
        $http({
          method: "GET",
          url: ApiConfig.api_endpoint + 'jmt/dashboard',
          headers: {
            'X-JMT-EndPoint-Token': $rootScope.endpoint_token,
            'X-JMT-EndPoint-Id': $rootScope.endpoint_id,
          }
        }).then(function (response) {
          if (response && response.data) {
            if (response.data.success && response.data.profile) {
              $rootScope.profile = response.data.profile;
              $rootScope.promotionList = response.data.profile.advertises;
              $rootScope.is_login = true;
              $state.go("app.home");
            } else if (response.data.message) {
              console.warn(response.data.message);
            } else {
              console.warn("An error occur while processing your request.");
            }
          } else {
            console.warn("An error occur while processing your request.");
          }
        }, function (error) {
          console.warn("$http error", error);
        });
      }
    } else {
      $rootScope.environment = localStorageService.get('environment');
      if (isEmpty($rootScope.environment)) {
        $rootScope.environment = AppEnv;
      }

      switch ($rootScope.environment) {
        case 'debug':
          if (!ApiConfig || !ApiConfig.api_endpoint) {
            ApiConfig.api_endpoint = "http://jmt.local/api/";
          }
          break;
        case 'develop':
          ApiConfig.api_endpoint = "https://jmt-loan-api-dev.play2pay.me/api/";
          break;
        case 'release':
          ApiConfig.api_endpoint = "https://jmt-loan-api-uat.play2pay.me/api/";
          break;
        case 'master':
        case 'production':
        default:
          //ApiConfig.api_endpoint = "https://jmt-loan-api-uat.play2pay.me/api/";
          ApiConfig.api_endpoint = "https://jmt-loan-api.jfintech.co.th/api/";


          break;
      }

      if ($rootScope.is_login === undefined || $rootScope.is_login === "undefined") {
        $rootScope.is_login = false;
      } else if ($rootScope.is_login === "true") {
        $rootScope.is_login = true;
      } else if ($rootScope.is_login === "false") {
        $rootScope.is_login = false;
      } else {
        $rootScope.is_login = !!($rootScope.is_login);
      }
    }

    localStorageService.bind($rootScope, 'show_notification', true);
    if ($rootScope.show_notification === undefined || $rootScope.show_notification === "undefined") {
      $rootScope.show_notification = false;
    } else if ($rootScope.show_notification === "true") {
      $rootScope.show_notification = true;
    } else if ($rootScope.show_notification === "false") {
      $rootScope.show_notification = false;
    } else {
      $rootScope.show_notification = !!($rootScope.show_notification);
    }

    $rootScope.getEnvironmentBadgeClass = function (env) {
      if (!env) {
        env = $rootScope.environment;
      }
      switch (env) {
        case 'debug':
          return 'badge-dark';
        case 'develop':
          return 'badge-calm';
        case 'release':
          return 'badge-energized';
        case 'master':
        case 'production':
        default:
          return 'badge-balanced';
      }
    };

    $rootScope.clickCount = 0;
    $rootScope.envArray = ["production", "release", "develop"];
    $rootScope.currentEnv = $rootScope.envArray.indexOf(localStorageService.get('environment')) || 0;
    $rootScope.changeEnv = function () {
      $rootScope.clickCount++;
      if ($rootScope.clickCount == 10) {
        $rootScope.clickCount = 0;
        $rootScope.currentEnv++;
        $rootScope.environment = $rootScope.envArray[$rootScope.currentEnv % $rootScope.envArray.length];
        localStorageService.set('environment', $rootScope.environment);
        switch ($rootScope.envArray[$rootScope.currentEnv % $rootScope.envArray.length]) {
          case 'debug':
            if (!ApiConfig || !ApiConfig.api_endpoint) {
              ApiConfig.api_endpoint = "http://docker.play2pay.me/api/";
            }
            break;
          case 'develop':
            ApiConfig.api_endpoint = "https://jmt-loan-api-dev.play2pay.me/api/";
            break;
          case 'release':
            ApiConfig.api_endpoint = "https://jmt-loan-api-uat.play2pay.me/api/";
            break;
          case 'master':
          case 'production':
          default:
            // ApiConfig.api_endpoint = "https://jmt-loan-api-uat.play2pay.me/api/";
            ApiConfig.api_endpoint = "https://jmt-loan-api.jfintech.co.th/api/";
            break;
        }
        //$ionicPopup.alert({
        //  title: "It is a magic",
        //  template: "Change environment to <strong>" + $rootScope.envArray[$rootScope.currentEnv % $rootScope.envArray.length] + "</strong>"
        //});
      }
    };

    $rootScope.savePasscode = function (password, next_state, delay) {
      console.log('savePasscode', password);

      if (!next_state) {
        next_state = "app.pincode";
      }
      if (!delay) {
        delay = 2000;
      }

      if (isEmpty(password)) {
        return false;
      }

      $ionicLoading.show({
        template: '<ion-spinner icon="lines" class="spinner-light"></ion-spinner>',
        duration: delay
      }).then(function () {
        var parsed_password = $filter('str_pad')(password, "0", 6);

        var tokenHash = md5($rootScope.endpoint_token + parsed_password);
        var encrypted_endpoint_token = CryptoJS.AES.encrypt($rootScope.endpoint_token, parsed_password);
        var encrypted_endpoint_id = CryptoJS.AES.encrypt($rootScope.endpoint_id + "", parsed_password);
        var encrypted_customer_id = CryptoJS.AES.encrypt($rootScope.customer_id + "", parsed_password);

        //console.info("parsed_password", parsed_password);
        //console.info("$rootScope.endpoint_token", $rootScope.endpoint_token, localStorageService.get('encrypted_endpoint_token'), encrypted_endpoint_token.toString());
        //console.info("$rootScope.endpoint_id", $rootScope.endpoint_id, localStorageService.get('encrypted_endpoint_id'), encrypted_endpoint_id.toString());
        //console.info("$rootScope.customer_id", $rootScope.customer_id, localStorageService.get('encrypted_customer_id'), encrypted_customer_id.toString());
        //console.info("tokenHash", tokenHash);

        //console.info("CryptoJS.AES.encrypt($rootScope.endpoint_token, parsed_password)", encrypted_endpoint_token.toString());
        var bytes = CryptoJS.AES.decrypt(encrypted_endpoint_token.toString(), parsed_password);
        var plaintext = bytes.toString(CryptoJS.enc.Utf8);
        //console.info("CryptoJS.AES.decrypt(encrypted_endpoint_token.toString(), parsed_password)", plaintext);

        localStorageService.set('token_hash', tokenHash);
        localStorageService.set('encrypted_endpoint_token', encrypted_endpoint_token.toString());
        localStorageService.set('encrypted_endpoint_id', encrypted_endpoint_id.toString());
        localStorageService.set('encrypted_customer_id', encrypted_customer_id.toString());

        if (!AppDebug) {
          localStorageService.remove('endpoint_id', 'endpoint_token', 'customer_id');
        }

        $state.go(next_state);
      });
    };

    localStorageService.bind($rootScope, 'application');
    if (!$rootScope.application) {
      $rootScope.application = {};
    }
    $rootScope.application = angular.extend({ //set data default
      prefix: 'mr',
      marital_status: 'single',
      contact_time_range: '08.00-12.00',
      document_address: '1',
      residence_type: 'house',
      bday_date: 1,
      bday_month: 1,
      bday_year: (moment().year() - 18),
      expire_idin_date: moment().date(),
      expire_idin_month: moment().month() + 1,
      expire_idin_year: moment().year(),
      business_type: 'sole',
      work_type: 'law',
      id_card_no_array: [],
      id_card_no: "",
      id_card_no_array2: [],
      id_card_no2: "",
      home_postcode_array: [],
      home_postcode: "",
      office_postcode_array: [],
      office_postcode: "",
      bank_account_no_array: [],
      bank_account_no: "",
      address_postcode: {0: 0},
      office_address_postcode: {0: 0},
      loan_receive_bank_account_number: {0: 0},
      document_trans_location: 1,
      loan_receive_limit: 0
    }, $rootScope.application);

    if ($rootScope.application && $rootScope.application.bday_month && $rootScope.application.bday_month == 0) {
      $rootScope.application.bday_month = 1;
    }
    if ($rootScope.application && $rootScope.application.expire_idin_month && $rootScope.application.expire_idin_month == 0) {
      $rootScope.application.expire_idin_month = 1;
    }

    $rootScope.application.id_card_no = _.toArray($rootScope.application.id_card_no_array).join('');
    $rootScope.application.id_card_no2 = _.toArray($rootScope.application.id_card_no_array2).join('');
    $rootScope.application.home_postcode = _.toArray($rootScope.application.home_postcode_array).join('');
    $rootScope.application.office_postcode = _.toArray($rootScope.application.office_postcode_array).join('');
    $rootScope.application.bank_account_no = _.toArray($rootScope.application.bank_account_no_array).join('');

    $rootScope.$watchCollection('application.id_card_no_array', function (arr) {
      $rootScope.application.id_card_no = "";
      angular.forEach(arr, function (val, id) {
        $rootScope.application.id_card_no += (val && parseInt(val) >= 0 && parseInt(val) <= 9) ? val : "";
      });
    }, true);

    $rootScope.$watchCollection('application.id_card_no_array2', function (arr) {
      $rootScope.application.id_card_no2 = "";
      angular.forEach(arr, function (val, id) {
        $rootScope.application.id_card_no2 += (val && parseInt(val) >= 0 && parseInt(val) <= 9) ? val : "";
      });
    }, true);

    $rootScope.$watchCollection('application.home_postcode_array', function (arr) {
      $rootScope.application.home_postcode = "";
      angular.forEach(arr, function (val, id) {
        $rootScope.application.home_postcode += (val && parseInt(val) >= 0 && parseInt(val) <= 9) ? val : "";
      });
    }, true);

    $rootScope.$watchCollection('application.office_postcode_array', function (arr) {
      $rootScope.application.office_postcode = "";
      angular.forEach(arr, function (val, id) {
        $rootScope.application.office_postcode += (val && parseInt(val) >= 0 && parseInt(val) <= 9) ? val : "";
      });
    }, true);

    $rootScope.$watchCollection('application.bank_account_no_array', function (arr) {
      $rootScope.application.bank_account_no = "";
      angular.forEach(arr, function (val, id) {
        $rootScope.application.bank_account_no += (val && parseInt(val) >= 0 && parseInt(val) <= 9) ? val : "";
      });
    }, true);

    $rootScope.currentDateTime = moment();
    $rootScope.currentDateTimeString = moment().format("YYYY-MM-DD");
    $rootScope.$watchGroup(['application.bday_date', 'application.bday_month', 'application.bday_year'], function (group) {
      var selectedYear = group[2];
      var selectedMonth = group[1];
      var selectedDay = group[0];

      var bday = moment({
        year: selectedYear,
        month: selectedMonth - 1,
        day: selectedDay,
        hour: 0,
        minute: 0,
        second: 0
      });
      $rootScope.application.birth_date = bday.isValid() ? bday.format("YYYY-MM-DD") : undefined;
    }, true);

    $rootScope.$watchGroup(['application.expire_idin_date', 'application.expire_idin_month', 'application.expire_idin_year'], function (group) {
      var selectedYear = group[2];
      var selectedMonth = group[1];
      var selectedDay = group[0];

      var bday = moment({
        year: selectedYear,
        month: selectedMonth - 1,
        day: selectedDay,
        hour: 0,
        minute: 0,
        second: 0
      });
      $rootScope.application.card_expired_date = bday.isValid() ? bday.format("YYYY-MM-DD") : undefined;
    }, true);

    if (ionic && ionic.Platform) {
      ionic.Platform.isFullScreen = false;
    }

    $rootScope.is_login = !!($rootScope.is_login);
    $rootScope.endpoint_token = "";
    $rootScope.currentLocation = {
      latitude: 0,
      longitude: 0
    };

    $rootScope.api_endpoint = ApiConfig.api_endpoint;

    /* DEBUG VARIABLE */
    $rootScope.otp_check = "987654";
    $rootScope.endpoint_token = "1b629ab7c628adc4e40705010ac745f3";
    $rootScope.isRequestNewOTP = false;

    window.addEventListener('native.keyboardshow', function (event) {
      console.info("native.keyboardshow", event);
      document.body.classList.add('keyboard-open');
      $("body.keyboard-open div.fix-keyboard").css({
        height: (parseInt(event.keyboardHeight) + 50) + 'px'
      });
    });

    window.addEventListener('native.keyboardhide', function (event) {
      console.info("native.keyboardhide", event);
      $("body div.fix-keyboard").css({
        height: 0
      });
    });

    $rootScope.ShowLocationErrorPopup = function (scope) {
      var errorPopup = $ionicPopup.show({
        template: 'ไม่สามารถค้นหาสาขาเจมาร์ทใกล้เคียงได้ เนื่องจากท่านไม่ได้เปิดใช้งาน Location',
        title: 'เกิดข้อผิดพลาด',
        subTitle: '',
        scope: scope,
        buttons: [
          {
            text: 'หน้าแรก',
            type: 'button-default',
            onTap: function (e) {
              e.preventDefault();
              errorPopup.close();
              $state.go("app.home");
            }
          },
          {
            text: '<b>ตั้งค่า</b>',
            type: 'button-positive',
            onTap: function (e) {
              e.preventDefault();
              errorPopup.close();
              scope.reloadStoreList = true;
              if (cordova && cordova.plugins && cordova.plugins.diagnostic) {
                cordova.plugins.diagnostic.switchToLocationSettings();
              }
            }
          }
        ]
      });

      return errorPopup;
    };

    $ionicPlatform.ready(function () {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }

      if (window.StatusBar) {
        // org.apache.cordova.statusbar required
        // StatusBar.hide();
        StatusBar.styleLightContent();
      }

      localStorageService.bind($rootScope, 'endpoint_code');

      if (isEmpty($rootScope.endpoint_code) || $rootScope.endpoint_code == null || $rootScope.endpoint_code === 'null') {
        $rootScope.endpoint_code = md5(Math.random().toString(36).substring(7));
      }

      $rootScope.platform = ionic.Platform.platform();

      //if(cordova && cordova.plugins && cordova.plugins.diagnostic) {
      //  cordova.plugins.diagnostic.isLocationAvailable(function (available) {
      //    console.log("Location is " + (available ? "available" : "not available"));
      //    if (available) {
      //      var onSuccess = function (position) {
      //        console.info('===== onSuccess =====' + '\n' +
      //          'Latitude: ' + position.coords.latitude + '\n' +
      //          'Longitude: ' + position.coords.longitude + '\n' +
      //          'Altitude: ' + position.coords.altitude + '\n' +
      //          'Accuracy: ' + position.coords.accuracy + '\n' +
      //          'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
      //          'Heading: ' + position.coords.heading + '\n' +
      //          'Speed: ' + position.coords.speed + '\n' +
      //          'Timestamp: ' + position.timestamp + '\n');
      //
      //        if (position.coords.latitude === 0 && position.coords.longitude === 0) {
      //          $rootScope.ShowLocationErrorPopup();
      //        } else {
      //          $rootScope.currentLocation = {
      //            latitude: position.coords.latitude,
      //            longitude: position.coords.longitude,
      //            altitude: position.coords.altitude,
      //            accuracy: position.coords.accuracy,
      //            altitudeAccuracy: position.coords.altitudeAccuracy,
      //          };
      //        }
      //      };
      //
      //      function onError(error) {
      //        console.warn('===== onError =====' + '\n' +
      //          'code: ' + error.code + '\n' +
      //          'message: ' + error.message + '\n');
      //
      //        $rootScope.ShowLocationErrorPopup();
      //      }
      //
      //      navigator.geolocation.getCurrentPosition(onSuccess, onError);
      //    }
      //  });
      //}

      $rootScope.checkLocationPermission = function () {
        if (window.cordova && cordova.plugins && cordova.plugins.diagnostic) {
          var setLocationPermission = function () {
            return cordova.plugins.diagnostic.requestLocationAuthorization(function (status) {
              console.info("cordova.plugins.diagnostic.requestLocationAuthorization >> status", status);
              $rootScope.locationPermissionStatus = status;
              switch (status) {
                case cordova.plugins.diagnostic.permissionStatus.NOT_REQUESTED:
                  return $q.reject(status);
                  break;
                case cordova.plugins.diagnostic.permissionStatus.DENIED:
                  return $q.reject(status);
                  break;
                case cordova.plugins.diagnostic.permissionStatus.GRANTED:
                  return $q.resolve(status);
                  break;
                case cordova.plugins.diagnostic.permissionStatus.GRANTED_WHEN_IN_USE:
                  return $q.resolve(status);
                  break;
              }
            }, function (error) {
              return $q.reject(error);
            }, cordova.plugins.diagnostic.locationAuthorizationMode.ALWAYS);
          };

          return cordova.plugins.diagnostic.getPermissionAuthorizationStatus(function (status) {
            $rootScope.locationPermissionStatus = status;
            switch (status) {
              case cordova.plugins.diagnostic.runtimePermissionStatus.GRANTED:
                return $q.resolve(true);
                break;
              case cordova.plugins.diagnostic.runtimePermissionStatus.NOT_REQUESTED:
                return setLocationPermission();
                break;
              case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED:
                return setLocationPermission();
                break;
              case cordova.plugins.diagnostic.runtimePermissionStatus.DENIED_ALWAYS:
                return setLocationPermission();
                break;
            }
          }, function (error) {
            return $q.reject(error);
          }, cordova.plugins.diagnostic.runtimePermission.ACCESS_COARSE_LOCATION);
        } else {
          return $q.reject('NO_SENSOR');
        }
      };
      $rootScope.checkLocationPermission();

      if (window.navigator && navigator.splashscreen) {
        $timeout(function () {
          navigator.splashscreen.hide();
        }, 1000);
      }

      if (window.cordova) {
        console.info("$cordovaDevice.getDevice()", $cordovaDevice.getDevice());

        if (typeof PushNotification !== 'undefined') {
          var push = PushNotification.init({"android": {"senderID": "604169745411"}});
          push.on('registration', function (data) {
            console.log("push.on('registration') >> DEVICE ID", data.registrationId);
            $rootScope.endpoint_code = data.registrationId;
            //$ionicPopup.alert({
            //  title: "PushNotification registration",
            //  template: JSON.stringify(data)
            //});
          });

          push.on('notification', function (data) {
            console.info("push.on('notification')", data);
            //data.title + " Message: " + data.message
            if ($rootScope.show_notification) {
              $ionicPopup.alert({
                title: data.title,
                template: data.message
              });
            }
          });

          push.on('error', function (e) {
            console.warn("push.on('error')", e);
            $ionicPopup.alert({
              title: "PushNotification error",
              template: JSON.stringify(e)
            });
            $rootScope.endpoint_code = md5(Math.random().toString(36).substring(7));
          });
        } else {
          $rootScope.endpoint_code = md5(Math.random().toString(36).substring(7));
        }
      } else {
        $rootScope.endpoint_code = md5(Math.random().toString(36).substring(7));
      }
    });


    // $rootScope.$on('cloud:push:notification', function (event, data) {
    // 	var msg = data.message;
    // 	alert(msg.title + ': ' + msg.text);
    // });


    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams, options) {

    });
    $rootScope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {
        event.preventDefault();
        //console.info("$rootScope.$on('$stateChangeSuccess')", '[' + fromState.name + '] ==> [' + toState.name + ']');
        $rootScope.previousState = "";
        $rootScope.previousStateParams = {};

        if (!localStorageService.get('token_hash') && !($state.includes('otp') || $state.includes('starter') || $state.includes('app.pincode') || $state.includes('app.application') )) {
          $ionicPopup.alert({
            title: "JFintech",
            template: 'Please Register.'
          }).then(function () {
            $state.go("starter");
          });
          return;
        } else if (($state.is('otp.verify') || $state.is('otp.password_setup')) && isEmpty($rootScope.account_id)) {
          $ionicPopup.alert({
            title: "JFintech",
            template: 'Your previous OTP request session has expired. Please try again.'
          }).then(function () {
            $state.go("otp.request");
          });
          return;
        }

        if (!$rootScope.is_login && !$rootScope.profile && !$rootScope.isRequestNewOTP && !($state.includes('otp') || $state.includes('starter') || $state.includes('app.pincode') || $state.includes('app.application') )) {
          if (!isEmpty(fromState.name) && toState.name === 'app.pincode') {
            $rootScope.previousState = fromState.name;
            $rootScope.previousStateParams = fromParams;
          }
          $state.go('app.pincode');
          return;
        }

        if (fromState.name === "app.pincode" && toState.name === "app.home") {
          $ionicHistory.clearHistory();
          $timeout(function () {
            $ionicLoading.hide();
          }, 1000);
        }

        switch (toState.name) {
          case "app.home":
            $rootScope.showBackButton = false;
            break;
          default:
            $rootScope.showBackButton = true;
            break;
        }
      });

    $rootScope.paymentList = [];
    $rootScope.promotionList = [];
    $rootScope.storeList = [];
    $rootScope.applicationList = [];

    $rootScope.parseLoanType = function (type) {
      var parseStr = ""+type;
      switch (parseStr.toLowerCase()) {
        case 'revolving':
        case 'revolving loan':
          // return 'สินเชื่อหมุนเวียนส่วนบุคคล';
          return 'สินเชื่อเงินสด';
        // case 'installment':
          // return 'การผ่อนชำระสินค้าทั่วไป';
        case 'mobile':
          // return 'การผ่อนชำระโทรศัพท์มือถือ';
          return 'สินเชื่อผ่อนสินค้า';
        case 'switching':
          return 'Switching';
        default:
          // return type;
          return "-";
      }
    };

    $rootScope.showBackButton = true;
    $rootScope.goBack = function () {
      console.info("$rootScope.goBack >> " + $ionicHistory.currentStateName() + "[" + $ionicHistory.currentHistoryId() + "]", $ionicHistory.viewHistory(), $ionicHistory.backTitle(), $ionicHistory.backView());
      var currentStateName = $ionicHistory.currentStateName() || "";
      switch (currentStateName) {
        case "app.application.create.step1":
          if (window.StatusBar && $rootScope.platform === "ios") {
            StatusBar.hide();
          }
          $state.go("starter");
          break;
        case "app.application.create.step2":
          $state.go("app.application.create.step1");
          break;
        case "app.application.create.step3":
          $state.go("app.application.create.step2");
          break;
        case "app.application.create.step4":
          $state.go("app.application.create.step3");
          break;
        case "app.application.create.step5":
          $state.go("app.application.create.step4");
          break;
        case "app.application.create.step6":
          if (window.StatusBar && $rootScope.platform === "ios") {
            StatusBar.hide();
          }
          $state.go("starter");
          break;
        case "otp.request":
          if (window.StatusBar && $rootScope.platform === "ios") {
            StatusBar.hide();
          }
          $state.go("starter");
          break;
        case "otp.verify":
          $state.go("otp.request");
          break;
        case "otp.password_setup":
          $state.go("otp.request");
          break;
        case "app.settings":
          $state.go("app.home");
          break;
        default:
          $ionicHistory.goBack();
          break;
      }
    };
  })
;
