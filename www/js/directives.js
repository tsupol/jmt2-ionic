var INTEGER_REGEXP = /^-?\d+$/;

angular.module('jmt.directives', [])
  .directive('errSrc', function() {
    return {
      link: function(scope, element, attrs) {
        attrs.$observe('ngSrc', function(value) {
          if (!value && attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });

        element.bind('error', function() {
          if (attrs.src != attrs.errSrc) {
            attrs.$set('src', attrs.errSrc);
          }
        });
      }
    }
  })
  .directive('ngEnter', function () {
    return function (scope, element, attrs) {
      element.bind("keydown keypress", function (event) {
        if(event.which === 13) {
          if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
            scope.$apply(function (){
              scope.$eval(attrs.ngEnter);
            });
          }

          event.preventDefault();
        }
      });
    };
  })
  .directive('a', function () {
    return {
      restrict: 'E',
      link: function (scope, elem, attrs) {
        if (attrs.linked) {
          return;
        }
        var tabPatt = /#(tab|collapse).*/;
        if (attrs.ngClick || attrs.href === '' || attrs.href === '#' || tabPatt.test(attrs.href) || attrs.noLink) {
          elem.on('click', function (e) {
            e.preventDefault();
          });
        }
      }
    };
  })
  .directive('convertToNumber', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function (val) {
          return parseInt(val, 10);
        });
        ngModel.$formatters.push(function (val) {
          return '' + val;
        });
      }
    };
  })
  .directive('stringToNumber', function() {
    return {
      require: 'ngModel',
      link: function(scope, element, attrs, ngModel) {
        ngModel.$parsers.push(function(value) {
          return '' + value;
        });
        ngModel.$formatters.push(function(value) {
          return parseFloat(value);
        });
      }
    };
  })
  .directive('numbersOnly', function () {
    return {
      require: 'ngModel',
      link: function (scope, element, attr, ngModelCtrl) {
        var isDecimal = attr.numbersOnly;

        function fromUser(text) {
          if (text) {
            if(typeof text === "number"){
              return text;
            }

            var regExp = (isDecimal === 'true' || isDecimal === 'yes') ? /[^0-9\.]/g : /[^0-9]/g;
            var transformedInput = text.replace(regExp, '');

            if (transformedInput !== text) {
              ngModelCtrl.$setViewValue(transformedInput);
              ngModelCtrl.$render();
            }
            return transformedInput;
          }
          return undefined;
        }
        ngModelCtrl.$parsers.push(fromUser);
      }
    };
  })
  .directive('integer', function() {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        ctrl.$validators.integer = function(modelValue, viewValue) {
          if (ctrl.$isEmpty(modelValue)) {
            // consider empty models to be valid
            return true;
          }

          if (INTEGER_REGEXP.test(viewValue)) {
            // it is valid
            return true;
          }

          // it is invalid
          return false;
        };
      }
    };
  })
  .directive('username', function($q, $timeout) {
    return {
      require: 'ngModel',
      link: function(scope, elm, attrs, ctrl) {
        var usernames = ['Jim', 'John', 'Jill', 'Jackie'];

        ctrl.$asyncValidators.username = function(modelValue, viewValue) {

          if (ctrl.$isEmpty(modelValue)) {
            // consider empty model valid
            return $q.resolve();
          }

          var def = $q.defer();

          $timeout(function() {
            // Mock a delayed response
            if (usernames.indexOf(modelValue) === -1) {
              // The username is available
              def.resolve();
            } else {
              def.reject();
            }

          }, 2000);

          return def.promise;
        };
      }
    };
  })
  .directive('autoNext', function($parse) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function(scope, element, attr, ctrl ) {
        var tabindex = parseInt(attr.tabindex);
        var maxLength = parseInt(attr.ngMaxlength);
        var currentValue, next, prev;

        element.on('click', function(e){
          element.select();
        });

        element.on('keydown', function(e) {
          currentValue = ctrl.$viewValue;
        });

        element.on('keyup', function(e) {
          //console.log( 'keyup', e.keyCode, e.key );
          //if((e.keyCode >=48 && e.keyCode <=57) || (e.keyCode >=96 && e.keyCode <=105) || e.keyCode===8 || e.keyCode===9 || e.keyCode === 37 || e.keyCode === 39 || e.keyCode === 229){
            if(e.keyCode == 37 || e.keyCode == 39 || e.key == 'ArrowLeft' || e.key == 'ArrowRight'){ // key allow left , allow right
              if(e.keyCode === 37 || e.key == 'ArrowLeft'){
                prev = angular.element(document.body).find('[tabindex=' + (tabindex-1) + ']');
                if(prev){
                  prev.focus().select();
                }
              }else if(e.keyCode === 39 || e.key == 'ArrowRight'){
                next = angular.element(document.body).find('[tabindex=' + (tabindex+1) + ']');
                if(next){
                  next.focus().select();
                }
              }
              return false;
            }
            else if(e.keyCode == 8 || e.key === 'Backspace') { // key backspace
              element.val('');
              if(isEmpty(currentValue)){
                prev = angular.element(document.body).find('[tabindex=' + (tabindex-1) + ']');
                prev.focus().select();
              }
              return false;
            }else{
              //console.log(  element.val() +'>='+ maxLength );
              if ( element.val().length >= maxLength ) {
                next = angular.element(document.body).find('[tabindex=' + (tabindex+1) + ']');

                if(element.val().length == maxLength){
                  next.focus().select();
                  return next.triggerHandler('keypress', { which: e.which});
                }else  {
                  element.val(e.key);
                  next.focus().select();
                  return false;
                }
              }
            }

            return true;
          //}
          //return false;
        });

      }
    }
  })
  .directive('match',function match ($parse) {
    return {
      require: '?ngModel',
      restrict: 'A',
      link: function(scope, elem, attrs, ctrl) {
        if(!ctrl || !attrs.match) {
          return;
        }

        var matchGetter = $parse(attrs.match);
        var caselessGetter = $parse(attrs.matchCaseless);
        var noMatchGetter = $parse(attrs.notMatch);
        var matchIgnoreEmptyGetter = $parse(attrs.matchIgnoreEmpty);

        scope.$watch(getMatchValue, function(){
          ctrl.$$parseAndValidate();
        });

        ctrl.$validators.match = function(modelValue, viewValue){
          var matcher = modelValue || viewValue;
          var match = getMatchValue();
          var notMatch = noMatchGetter(scope);
          var value;

          if (matchIgnoreEmptyGetter(scope) && !viewValue) {
            return true;
          }

          if(caselessGetter(scope)){
            value = angular.lowercase(matcher) === angular.lowercase(match);
          }else{
            value = matcher === match;
          }
          /*jslint bitwise: true */
          value ^= notMatch;
          /*jslint bitwise: false */
          return !!value;
        };

        function getMatchValue(){
          var match = matchGetter(scope);
          if(angular.isObject(match) && match.hasOwnProperty('$viewValue')){
            match = match.$viewValue;
          }
          return match;
        }
      }
    };
  })
  .directive('dateGreaterThan', function () {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attributes, ngModelController) {
        var otherValue, parsedViewValue;

        scope.$watch(attributes.dateGreaterThan, function (value) {
          otherValue = String(value).replace(/\-/gi,'');
          ngModelController.$validate();
        });

        ngModelController.$parsers.push(function (viewValue) {
          parsedViewValue = String(viewValue).replace(/\-/gi,'');
          ngModelController.$setValidity('dateGreaterThan', viewValue && otherValue && (parseInt(parsedViewValue) >= parseInt(otherValue)));

          return viewValue;
        });

        ngModelController.$validators.dateGreaterThan = function(modelValue, viewValue) {
          var value = modelValue || viewValue;
          parsedViewValue = String(value).replace(/\-/gi,'');
          return viewValue && otherValue && (parseInt(parsedViewValue) >= parseInt(otherValue));
        };
      }
    };
  })
;
