angular.module('jmt.profile', [])
  .controller('ProfileController', function ($scope, $rootScope, Api) {
    $scope.profile = $rootScope.profile;

    $scope.$on("UpdateProfileData", function (event, profile) {
      $scope.profile = $rootScope.profile;
    });

    $scope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {
        console.info("ProfileController.$on('$stateChangeSuccess')", '[' + fromState.name + '] ==> [' + toState.name + ']', this);
        if (!isEmpty(fromState.name) && toState.name=='app.profile' && !isEmpty($rootScope.profile)) {
          $scope.profile = $rootScope.profile;

          $rootScope.profile.phone = $scope.profile.user.formdata.mobile_1;
          if ($scope.profile.user.formdata.mobile_2 && $scope.profile.user.formdata.mobile_1 != '') {
            $rootScope.profile.phone += ',' + $scope.profile.user.formdata.mobile_2;
          }

          var year = parseInt($scope.profile.user.formdata.bday_year);
          year += 543;
          $rootScope.profile.birthdate = (year.toString()) + '-' + $scope.profile.user.formdata.bday_month + '-' + $scope.profile.user.formdata.bday_date;

          $scope.profile.email = $scope.profile.user.formdata.email;
        }
      });

    // },260);
    // Api.get('jmt/customer').then(
    //   function (res) {
    //     console.info(res);
    //     if( res && res.data && res.data.items ){
    //
    //       // $ionicPopup.alert({
    //       //   title: 'สำเร็จ',
    //       //   template: 'ทำการแก้ไขข้อมูลเรียบร้อย'
    //       // });//.then();
    //       // $state.go("app.profile");
    //     }else{
    //       var message_alert = '';
    //       if(res.data.error_message) {
    //         for (var key in res.data.error_message){
    //           message_alert += res.data.error_message[key]+'<br>';
    //         }
    //       }else{
    //         message_alert = 'ไม่สามารถเชื่อมต่อเซิฟเวอร์ได้';
    //       }
    //       $ionicPopup.alert({
    //         title: 'ระบบขัดข้อง',
    //         template: message_alert
    //       });
    //       console.error(res);
    //     }
    //     $ionicLoading.hide();
    //   },
    //   function (err) {
    //     console.error(err);
    //     $ionicLoading.hide();
    //   }
    // )

    $scope.getProfileAddress = function (profile) {


      var profile_address = "";

      if (!isEmpty(profile.address1)) {
        profile_address = profile_address + " " + profile.address1;
      }
      if (!isEmpty(profile.address2)) {
        profile_address = profile_address + " " + profile.address2;
      }
      if (!isEmpty(profile.subdistrict)) {
        profile_address = profile_address + " " + profile.subdistrict;
      }
      if (!isEmpty(profile.district)) {
        profile_address = profile_address + " " + profile.district;
      }
      if (!isEmpty(profile.province)) {
        profile_address = profile_address + " " + profile.province;
      }
      if (!isEmpty(profile.postcode)) {
        profile_address = profile_address + ", " + profile.postcode;
      }

      return profile_address;
    };
  })
  .controller('ProfileEditController', function ($scope, $rootScope, $ionicPopup, $state, $ionicLoading, Api) {

    var date_selects = {};
    for (var i = 1; i <= 31; i++) {
      date_selects[(i - 1)] = {id: i, value: i};
    }
    $scope.date_selects = date_selects;

    $scope.month_selects = [
      {id: 1, value: 'มกราคม'},
      {id: 2, value: 'กุมภาพันธ์'},
      {id: 3, value: 'มีนาคม'},
      {id: 4, value: 'เมษายน'},
      {id: 5, value: 'พฤษภาคม'},
      {id: 6, value: 'มิถุนายน'},
      {id: 7, value: 'กรกฎาคม'},
      {id: 8, value: 'สิงหาคม'},
      {id: 9, value: 'กันยายน '},
      {id: 10, value: 'ตุลาคม'},
      {id: 11, value: 'พฤศจิกายน'},
      {id: 12, value: 'ธันวาคม'}
    ];

    var year_selects = {};
    //var today = new Date();
    var year_now = new Date().getFullYear();
    var year_val = year_now - 17;
    for (var i = 1; i <= 80; i++) {
      year_selects[(i - 1)] = {id: year_val, value: (year_val + 543)};
      year_val--;
    }
    $scope.year_selects = year_selects;

    //$ionicLoading.show();
    $scope.profiles = {
      prefix: 'mr',
      marital_status: 'single',
      contact_time_range: '08.00-12.00',
      document_trans_address_type: 'idcard',
      bday_date: 1,
      bday_month: 1,
      bday_year: (year_now - 17),
      //mock
      // "idens": [
      //   0,1,5,0,9,9,0,0,0,2,4,2,0,0
      // ],
      // "prefix" : "mr",
      // "name_th" : "ชื่อ",
      // "surname_th" : "นามสกุล",
      // "nickname_th" : "ชื่อเล่น",
      // "name_en" : "ชื่ออังกฤษ",
      // "surname_en" : "นามสกุลอังกฤษ",
      // "mobile_1" : "0221",
      // "mobile_2" : "053053",
      // "document_trans_location" : "dddd",
      // "email" : "ss@ss.com",
    };

    $scope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {
        console.info("ProfileEditController.$on('$stateChangeSuccess')", '[' + fromState.name + '] ==> [' + toState.name + ']');
        if (!isEmpty(fromState.name) && toState.name=='app.profile_edit' && !isEmpty($rootScope.profile)) {
          if ($rootScope.profile.user.formdata && $rootScope.profile.user.formdata != '') {
            console.log('$scope.profile edit', $scope.profile);
            $scope.profiles = $rootScope.profile.user.formdata;
          }
        }
      });


    $scope.submit_login = function () {
    };

    $scope.submit = function () {
      //sendapi
      Api.post('jmt/customer', {profiles: $scope.profiles}, 'POST', null, "application/json").then(
        function (res) {
          console.info(res);
          if (res && res.items) {

            $ionicPopup.alert({
              title: 'สำเร็จ',
              template: 'ทำการแก้ไขข้อมูลเรียบร้อย'
            });//.then();

            $rootScope.profile.user.name = $scope.profiles.name_th + ' ' + $scope.profiles.surname_th;

            $rootScope.profile.phone = $scope.profiles.mobile_1;
            if ($scope.profiles.mobile_2 && $scope.profiles.mobile_2 != '') {
              $rootScope.profile.phone += ',' + $scope.profiles.mobile_2;
            }

            var year = parseInt($scope.profiles.bday_year);
            year += 543;
            $rootScope.profile.birthdate = (year.toString()) + '-' + $scope.profiles.bday_month + '-' + $scope.profiles.bday_date;

            $rootScope.profile.email = $scope.profiles.email;
            $rootScope.profile.user.formdata = $scope.profiles;

            $state.go("app.settings");
          } else {

            var message_alert = '';
            if ( res.error_message ) {
              for (var key in res.error_message) {
                message_alert += res.error_message[key] + '<br>';
              }
            } else {
              message_alert = 'ไม่สามารถเชื่อมต่อเซิฟเวอร์ได้';
            }
            console.log('error');
            $ionicPopup.alert({
              title: 'ระบบขัดข้อง',
              template: message_alert
            });
            console.error(res);
          }
          $ionicLoading.hide();
        },
        function (err) {
          console.error(err);
          $ionicLoading.hide();
        }
      );
    };

  })
  .controller('ChangePasswordController', function ($scope, $ionicPopup, $ionicLoading, $rootScope, localStorageService, AppDebug) {
    $scope.new_password = '';
    $scope.retype_password = '';
    $scope.profile = {
      new_password: '',
      retype_password: ''
    };

    $scope.submit = function () {
      if (isEmpty($scope.profile.new_password)) {
        $ionicPopup.alert({
          title: "JFintech",
          template: 'Please enter New Password before submitting.'
        });
        return false;
      }

      // var reg = new RegExp('^[0-9]{6}$');
      // if(!reg.test($scope.new_password)){
      //   $ionicPopup.alert({
      //     title: "JFintech",
      //     template: 'รหัสผ่านต้องเป็นตัวเลข 6 หลัก'
      //   });
      //   return false;
      // }

      if (isEmpty($scope.profile.retype_password)) {
        $ionicPopup.alert({
          title: "JFintech",
          template: 'Please enter Re-type Password before submitting.'
        });
        return false;
      }

      if (!angular.equals($scope.profile.new_password, $scope.profile.retype_password)) {
        $ionicPopup.alert({
          title: "JFintech",
          template: 'New Password and Re-type Password is not match. Please check them again.'
        });
        return false;
      }

      $rootScope.savePasscode($scope.profile.new_password, "app.profile_edit", 1000);
    };
  })

  .controller('ForgotPasswordController', function ($scope) {

  });
