angular.module('jmt.pincode', ['LocalStorageModule'])
  .controller('PincodeController', function ($scope, $rootScope, $state, $location, $timeout, $ionicHistory, $ionicPopup, $ionicLoading, localStorageService, $q, $http, ApiConfig, AppDebug, $window) {
    $ionicHistory.nextViewOptions({
      disableBack: true
    });

    $scope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {
        //console.info("PincodeController.$on('$stateChangeSuccess')", '[' + fromState.name + '] ==> [' + toState.name + ']');
        //if(!isEmpty(fromState.name)){
        if(toState.name == 'app.pincode') {
          $scope.passcode = "";
          $scope.token_hash = localStorageService.get('token_hash');
          $scope.encrypted_endpoint_token = localStorageService.get('encrypted_endpoint_token');
          $scope.encrypted_endpoint_id = localStorageService.get('encrypted_endpoint_id');
          $scope.encrypted_customer_id = localStorageService.get('encrypted_customer_id');

          //console.info("$scope.token_hash", $scope.token_hash);
          //console.info("$scope.encrypted_endpoint_token", $scope.encrypted_endpoint_token);
          //console.info("$scope.encrypted_endpoint_id", $scope.encrypted_endpoint_id);
          //console.info("$scope.encrypted_customer_id", $scope.encrypted_customer_id);

          if (isEmpty($scope.token_hash) || isEmpty($scope.encrypted_endpoint_token)) {
            $state.go("starter");
            return false;
          }

          $ionicLoading.hide();
        }
      });

    $scope.RequestNewOTP = function () {
      $ionicPopup.confirm({
        title: "ล้างข้อมูล",
        template: "ท่านต้องการล้างข้อมูลที่ได้บันทึกไว้ ใช่หรือไม่?"
      }).then(function (res) {
        if (res) {
          $rootScope.isRequestNewOTP = true;
          $rootScope.account_id = "";
          localStorageService.cookie.clearAll();
          localStorageService.clearAll();
          $ionicHistory.clearCache();
          $ionicHistory.clearHistory();
          $window.localStorage.clear();
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
          }, {});
          localStorageService.set('application', $rootScope.application);
          localStorageService.set('endpoint_code', $rootScope.endpoint_code);
          $state.go('starter');
        }
      });
    };

    $scope.passcodeLength = 6;
    $scope.passcode = "";
    $scope.incorrectTime = 0;

    $scope.init = function () {
      $scope.passcode = "";
    };

    $scope.displayPasscode = function (position) {
      var p = $scope.passcode.substring(position - 1, position);
      if (isEmpty(p)) {
        return '';
      }

      if ($scope.passcode.length === position && $scope.passcode.length < 6) {
        return p;
      }

      return '<i class="ion-ios-medical"></i>';
    };

    $scope.validate = function () {
      var deferred = $q.defer();

      try {
        var encrypted_endpoint_token = CryptoJS.AES.decrypt($scope.encrypted_endpoint_token, $scope.passcode);
        $rootScope.endpoint_token = encrypted_endpoint_token.toString(CryptoJS.enc.Utf8);
        //console.info("$scope.passcode", $scope.passcode);
        //console.info("$rootScope.endpoint_token", $rootScope.endpoint_token);
      } catch (e) {
        $rootScope.endpoint_token = "";
      }

      try {
        var encrypted_endpoint_id = CryptoJS.AES.decrypt($scope.encrypted_endpoint_id, $scope.passcode);
        $rootScope.endpoint_id = parseInt(encrypted_endpoint_id.toString(CryptoJS.enc.Utf8), 10);
      } catch (e) {
        $rootScope.endpoint_id = 0;
      }

      try {
        var encrypted_customer_id = CryptoJS.AES.decrypt($scope.encrypted_customer_id, $scope.passcode);
        $rootScope.customer_id = parseInt(encrypted_customer_id.toString(CryptoJS.enc.Utf8), 10);
      } catch (e) {
        $rootScope.customer_id = 0;
      }

      if (md5($rootScope.endpoint_token + $scope.passcode) === $scope.token_hash) {
        return $ionicLoading.show({
          template: '<ion-spinner icon="lines" class="spinner-light"></ion-spinner>',
          duration: 15 * 1000
        }).then(function () {
          return $http({
            method: "GET",
            url: ApiConfig.api_endpoint + 'jmt/dashboard',
            headers: {
              'X-JMT-EndPoint-Token': $rootScope.endpoint_token,
              'X-JMT-EndPoint-Id': $rootScope.endpoint_id,
            }
          }).then(function (response) {
            if (response && response.data) {
              if (response.data.success && response.data.profile) {
                if (AppDebug) {
                  localStorageService.set('endpoint_token', $scope.endpoint_token);
                  localStorageService.set('endpoint_id', $scope.endpoint_id);
                  localStorageService.set('customer_id', $scope.customer_id);
                }

                return response.data.profile;
              } else if (response.data.message) {
                return $q.reject(response.data.message);
              } else {
                return $q.reject("An error occur while processing your request.");
              }
            } else {
              return $q.reject("An error occur while processing your request.");
            }
          }, function (error) {
            console.warn("$http error", error);
            return $q.reject('HTTP_ERROR');
          });
        });
      } else {
        return $q.reject('token_hash_mismatch');
      }
    };

    $scope.add = function (value) {
      if ($scope.passcode.length < $scope.passcodeLength) {
        $scope.passcode = $scope.passcode + value;
        if ($scope.passcode.length == $scope.passcodeLength) {
          $timeout(function () {
            $scope.validate().then(function (profile) {
              //console.info("$scope.validate() profile", profile);
              $scope.passcode = "";
              $rootScope.profile = profile;
              $rootScope.promotionList = profile.advertises;
              $rootScope.is_login = true;

              //$state.go($rootScope.previousState || "app.home", $rootScope.previousStateParams || {});
              $state.go("app.home");
            }, function (err) {
              console.warn(err);
              if(err == 'HTTP_ERROR'){
                $ionicPopup.alert({
                  title: "เกิดข้อผิดพลาด",
                  template: "ไม่สามารถเชื่อมต่อกับเซิฟเวอร์ได้ เนื่องจากปัญหาด้านอินเตอร์เน็ต"
                }).then(function () {
                  $scope.passcode = "";
                });
              }else{
                $ionicPopup.alert({
                  title: "เกิดข้อผิดพลาด",
                  template: "ท่านกรอกรหัสผ่านผิด เป็นจำนวน <strong>" + (++$scope.incorrectTime) + "</strong> ครั้ง."
                }).then(function () {
                  $scope.passcode = "";
                });
              }
            }).finally(function () {
              $ionicLoading.hide();
            });
          }, 250);
        }
      }
    };

    $scope.delete = function () {
      if ($scope.passcode.length > 0) {
        $scope.passcode = $scope.passcode.substring(0, $scope.passcode.length - 1);
      }
    };
  });
