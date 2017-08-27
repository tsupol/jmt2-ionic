angular.module('jmt.loan', [])
  .controller('LoanListController', function ($scope, $rootScope, moment, $state) {
    $scope.currentTime = moment();
    $scope.dueDate = moment().add(1, 'months');

    $scope.loanList = [];
    $scope.current_total_due_amount = 0;

    $scope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {
        if(!isEmpty(fromState.name) && (toState.name=="app.loan.list" || toState.name=="app.loan.overview")) {
          if($rootScope.profile && $rootScope.profile.loans) {
            $scope.loanList = $rootScope.profile.loans;
            console.info("$scope.loanList", $scope.loanList);
            if($rootScope.profile.summary && $rootScope.profile.summary.due_date){
              $scope.dueDate = $rootScope.profile.summary.due_date;
            }

            if($rootScope.profile.summary && $rootScope.profile.summary.current_total_due_amount){
              $scope.current_total_due_amount = $rootScope.profile.summary.current_total_due_amount;
            }else {
              $scope.current_total_due_amount = _.chain($scope.loanList).pluck('due_amount').reduce(function(memo, num){
                return memo + parseFloat(num)
              }, 0).value();
            }
          }
        }
      }
    );

    $rootScope.parseLoanName = function (item_name) {
      if(/^Contract (.+?)/.test(item_name)){
        return item_name.replace('Contract ', '')
      }

      return item_name
    }

    $scope.openLoanDetail = function (id, $event) {
      if($event) {
        $event.preventDefault();
      }
      $state.go("app.loan.detail.main", {loanId: id});
    };
  })
  .controller('LoanDetailController', function ($scope, $rootScope, $stateParams, $state, $ionicModal) {
    $scope.loanId = parseInt($stateParams.loanId) || 1;
    $scope.item = {};
    $scope.currentSlideIndex = 0;
    $scope.barcodeOptions = {
      width: 1,
      height: 20,
      displayValue: true,
      fontSize: 10,
    };

    $scope.barcodeOptions2 = {
      width: 1,
      height: 60,
      displayValue: true,
      fontSize: 14,
    };

    $scope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {
        console.info("LoanDetailController.$on('$stateChangeSuccess')", '[' + fromState.name + '] ==> [' + toState.name + ']');
        $scope.loanId = $stateParams.loanId;
        if(!isEmpty(fromState.name) && toState.name=="app.loan.detail.main") {
          if($rootScope.profile && $rootScope.profile.loans) {
            $scope.loanList = $rootScope.profile.loans;
            if(!isEmpty($scope.loanList)){
              $scope.item = _.findWhere($scope.loanList, {"id": $scope.loanId});
              $scope.item.bill_barcode = $scope.item.ref1;
              var tmp = $scope.item.ref1.split('\r')
              console.info("$scope.item.ref1.split('\r')", tmp);
              if(tmp.length>1){
                console.info(111)
                $scope.item.bill_barcode = $scope.item.ref1
                $scope.item.bill_ref1 = tmp[1];
                $scope.item.bill_ref2 = tmp[2];
              }else{
                console.info(222)
                tmp = $scope.item.ref1.split('_')
                if(tmp.length>1){
                  console.info(333)
                  $scope.item.bill_barcode = $scope.item.ref1.replace(/[_]+/g, '\r');
                  $scope.item.bill_ref1 = tmp[1];
                  $scope.item.bill_ref2 = tmp[2];
                }else{
                  console.info(444)
                  $scope.tax_id = $scope.item.ref1.substr(0, 13)
                  $scope.suffix = $scope.item.ref1.substr(13, 2)
                  $scope.ref1 = $scope.item.ref1.substr(15, 16)
                  $scope.ref2 = $scope.item.ref1.substr(31, 13)
                  $scope.bill_amount = $scope.item.ref1.substr(44)
                  $scope.item.bill_barcode = $scope.tax_id + $scope.suffix + '\r' + $scope.ref1 + '\r' + $scope.ref2 + '\r' + $scope.bill_amount
                  $scope.item.bill_ref1 = $scope.ref1;
                  $scope.item.bill_ref2 = $scope.ref2;
                }
              }
              console.info("$scope.item.bill_barcode", $scope.item.bill_barcode);
            }
          }
        }
      }
    );

    $scope.openPaymentDetail = function (id) {
      $state.go("app.loan.detail.payment_view", {paymentId: id});
    };

    $scope.calculateRefSize = function (ref) {
      var retStyle = {};
      if(ref){
        if(_.size(ref) > 12){
          retStyle = {fontSize: '14px'};
        }else if(_.size(ref) > 8){
          retStyle = {fontSize: '16px'};
        }else if(_.size(ref) > 4){
          retStyle = {fontSize: '24px'};
        }else{
          retStyle = {fontSize: '32px'};
        }
      }

      retStyle.fontWeight = 'bold'

      return retStyle;
    };

    $scope.slideHasChanged = function (index) {
      $scope.currentSlideIndex = index;
    };

    $scope.openSlideImageModal = function (index) {
      switch(index){
        case 0:
          $scope.reference = $scope.item.ref1;
          $scope.modalType = "barcode";
          $ionicModal.fromTemplateUrl('modal-view-image.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.modal = modal;
            modal.show();
          });
          //$scope.openModal();
          break;
        case 1:
        default:
          $scope.reference = $scope.item.ref2;
          $scope.modalType = "qrcode";
          $ionicModal.fromTemplateUrl('modal-view-image.html', {
            scope: $scope,
            animation: 'slide-in-up'
          }).then(function(modal) {
            $scope.modal = modal;
            modal.show();
          });
          //$scope.openModal();
          break;
      }
    };

    $scope.closeSlideImageModal = function() {
      $scope.modal.hide();
    };
    // Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      $scope.modal.remove();
    });
    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });
    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });
  })

  .controller('LoanPaymentListController', function ($scope, $rootScope, $stateParams, $state) {
    $scope.loanId = $stateParams.loanId;
    $scope.loan = {};
    $scope.paymentList = [];

    $scope.$on('$stateChangeSuccess',
      function (event, toState, toParams, fromState, fromParams) {
        console.info("LoanDetailController.$on('$stateChangeSuccess')", '[' + fromState.name + '] ==> [' + toState.name + ']');
        $scope.loanId = $stateParams.loanId;
        if(!isEmpty(fromState.name) && toState.name=="app.loan.detail.payment_list") {
          if($rootScope.profile && $rootScope.profile.loans) {
            $scope.loan = _.findWhere($rootScope.profile.loans, {"id": $scope.loanId});
            if($scope.loan){
              $scope.paymentList = $scope.loan.payment_list;
            }
          }
        }
      }
    );

    $scope.openPaymentDetail = function (id) {
      $state.go("app.loan.detail.payment_view", {paymentId: id});
    }
  })
