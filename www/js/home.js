angular.module('jmt.home', []).controller('HomeController', function ($scope, $rootScope, moment, $state, Api) {
  $scope.currentTime = moment();

  if (!$rootScope.profile) {
    $state.go("app.pincode");
    return;
  }

  $scope.openLoanApplication = function () {
    var lastApplication = _.chain($rootScope.applicationList).sortBy('id').last().value();
    if (lastApplication && !_.contains(["approved"], lastApplication.status)) {
      $state.go("app.application.detail", {applicationId: lastApplication.id});
    } else {
      $state.go("app.application.create.step1");
    }
  };

  $scope.options = {
    loop: false,
    effect: 'fade',
    speed: 500
  };

  $scope.$on("$ionicSlides.sliderInitialized", function (event, data) {
    // data.slider is the instance of Swiper
    $scope.slider = data.slider;
  });

  $scope.$on("$ionicSlides.slideChangeStart", function (event, data) {
    console.log('Slide change is beginning');
  });

  $scope.$on("$ionicSlides.slideChangeEnd", function (event, data) {
    // note: the indexes are 0-based
    $scope.activeIndex = data.slider.activeIndex;
    $scope.previousIndex = data.slider.previousIndex;
  });

  $scope.$on('$stateChangeSuccess',
    function (event, toState, toParams, fromState, fromParams) {
      if(toState.name=="app.home") {
        if($rootScope.profile && $rootScope.profile.summary) {
          if(!$rootScope.profile.summary.credit_use){
            $rootScope.profile.summary.credit_use = ($rootScope.profile.summary.credit_limit || 0) - ($rootScope.profile.summary.credit_left || 0);
          }
        }
      }
    }
  );
})
