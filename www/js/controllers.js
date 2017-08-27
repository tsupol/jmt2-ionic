angular.module('jmt.controllers', ['ngSanitize'])

  .controller('AppController', function ($scope, $rootScope, $ionicModal, $timeout, $state) {

    // With the new view caching in Ionic, Controllers are only called
    // when they are recreated or on app start, instead of every page change.
    // To listen for when this page is active (for example, to refresh data),
    // listen for the $ionicView.enter event:
    //$scope.$on('$ionicView.enter', function(e) {
    //});

    // Form data for the login modal
    $scope.loginData = {};

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function (modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function () {
      $scope.modal.hide();
    };

    // Open the login modal
    $scope.login = function () {
      $scope.modal.show();
    };

    $scope.logout = function () {
      $rootScope.endpoint_token = "";
      $rootScope.is_login = false;
      $state.go("starter");
    };

    // Perform the login action when the user submits the login form
    $scope.doLogin = function () {
      console.log('Doing login', $scope.loginData);

      // Simulate a login delay. Remove this and replace with your login
      // code if using a login system
      $timeout(function () {
        $scope.closeLogin();
      }, 1000);
    };
  })

  .controller('StarterPageController', function ($scope, $rootScope, $state, localStorageService, $ionicPopup, ApiConfig, $ionicPlatform) {
    $ionicPlatform.ready(function () {
      // $ionicPopup.alert({
      //   title: "JFintech",
      //   template: "เรียนคุณลูกค้า ปัจจุบัน Application กำลังอยู่ระหว่างขั้นตอนการพัฒนา ต้องขออภัยในความไม่สะดวก"
      // });
      if (window.StatusBar && $rootScope.platform === "ios") {
        StatusBar.hide();
      }
    });

    $scope.checkLogin = function () {
      if (window.StatusBar && $rootScope.platform === "ios") {
        StatusBar.show();
      }

      // if (localStorageService.get("token_hash")) {
      //   $state.go("app.pincode");
      // } else {
      $state.go("otp.request");
      // $ionicPopup.alert({
      //   title: "JFintech",
      //   template: "คุณยังไม่ได้ตั้งค่ารหัสความปลอดภัย คลิกเพื่อขอคำร้องในการตั้งค่า."
      // }).then(function () {
      //   $state.go("otp.request");
      // });
      // }

    };

    $scope.signupContract = function () {
      if (window.StatusBar && $rootScope.platform === "ios") {
        StatusBar.show();
      }

      $state.go("app.application.create.step1");
    };
  })

  .controller('NavigationController', function ($scope, $rootScope, $ionicHistory) {
    $scope.goBack = function() {
      console.info("NavigationController.goBack >> " + $ionicHistory.currentStateName() + "[" + $ionicHistory.currentHistoryId() + "]", $ionicHistory.viewHistory(), $ionicHistory.backTitle(), $ionicHistory.backView());
      $ionicHistory.goBack();
    };
  })

