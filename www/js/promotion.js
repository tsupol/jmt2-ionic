angular.module('jmt.promotion', [])
  .controller('PromotionCarouselController', function($scope, $rootScope, $state, $cordovaInAppBrowser, $ionicPopup){
    // $scope.$on('$stateChangeSuccess',
    //   function (event, toState, toParams, fromState, fromParams) {
    //     if (isEmpty($rootScope.promotionList)) {
    //       Api.get('jmt/store').then(function (response) {
    //         if (response && response.data) {
    //           if (response.data.success && response.data.list) {
    //             $rootScope.promotionList = response.data.list;
    //             return $rootScope.promotionList;
    //           } else if (response.data.message) {
    //             $rootScope.promotionList = [];
    //             return $q.reject(response.data.message);
    //           } else {
    //             $rootScope.promotionList = [];
    //             return $q.reject("An error occur while processing your request.");
    //           }
    //         } else {
    //           $rootScope.promotionList = [];
    //           return $q.reject("An error occur while processing your request.");
    //         }
    //       }, function (error) {
    //         console.warn("$http error", error);
    //         $rootScope.promotionList = [];
    //       });
    //     }
    //   }
    // );

    $scope.options = {
      loop: true,
      effect: 'slide',
      speed: 500,
      autoPlay: 1000
    };

    $scope.$on("$ionicSlides.sliderInitialized", function(event, data){
      // data.slider is the instance of Swiper
      $scope.slider = data.slider;
    });

    $scope.$on("$ionicSlides.slideChangeStart", function(event, data){
      console.log('Slide change is beginning');
    });

    $scope.$on("$ionicSlides.slideChangeEnd", function(event, data){
      // note: the indexes are 0-based
      $scope.activeIndex = data.slider.activeIndex;
      $scope.previousIndex = data.slider.previousIndex;
    });

    $scope.openPromotionDetail = function (id) {
      $scope.item = _.findWhere($rootScope.promotionList, {"id": id});

      switch($scope.item.type){
        case 'post':
        case 'POST':
          $state.go("app.promotion.detail", {promotionId: $scope.item.id});
          break;
        case 'link':
        case 'LINK':
          // var options = {
          //   location: 'yes',
          //   clearcache: 'yes',
          //   toolbar: 'no'
          // };

          var options2 = {
            statusbar: {
              color: '#ffffffff'
            },
            toolbar: {
              height: 32,
              color: '#FE5C44'
            },
            title: {
              color: '#ffffff',
              showPageTitle: true
            },
            closeButton: {
              wwwImage: 'img/cross.png',
              align: 'left',
              event: 'closePressed'
            },
            backButtonCanClose: false
          };


          var link = $scope.item.link || $scope.item.type_description || 'http://www.jmtnetwork.co.th/';

          if(window.cordova){
            document.addEventListener("deviceready", function () {


              cordova.ThemeableBrowser.open(link, '_blank', options2);



              // $cordovaInAppBrowser.open(link, '_system', options)
              //   .then(function(event) {
              //     // success
              //     console.info("$cordovaInAppBrowser success");
              //   })
              //   .catch(function(event) {
              //     // error
              //     console.warn("$cordovaInAppBrowser error");
              //   });
              //
              //
              // // $cordovaInAppBrowser.close();

            }, false);
          }else{
            window.open(link, '_system');
          }

          break;
        default:
          // $ionicPopup.alert({
          //   title: "JFintech",
          //   template: 'ไม่พบแอปสำหรับเปิดลิงก์ <strong>"' + $scope.item.title + '"</strong>'
          // }).then(function(){
          //
          // });
          break;
      }
    }
})
  .controller('PromotionDetailController', function($scope, $rootScope, $stateParams){


    $scope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {
        if (toState.name == 'app.promotion.detail') {
          $scope.promotionId = parseInt($stateParams.promotionId) || 1;
          $scope.item = _.findWhere($rootScope.promotionList, {"id": $scope.promotionId});
        }
      }
    );

  })
