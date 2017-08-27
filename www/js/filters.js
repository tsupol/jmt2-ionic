angular.module('jmt.filters', [])
  .filter('truncate', function (){
    return function (text, length, end){
      if (text !== undefined){
        if (isNaN(length)){
          length = 10;
        }

        if (end === undefined){
          end = "...";
        }

        if (text.length <= length || text.length - end.length <= length){
          return text;
        }else{
          return String(text).substring(0, length - end.length) + end;
        }
      }
    };
  })
  .filter('shorten', function () {
    return function (value, wordwise, max, tail) {
      if (!value) value = 32;

      max = parseInt(max, 10);
      if (!max) return value;
      if (value.length <= max) return value;

      value = value.substr(0, max);
      if (wordwise) {
        var lastspace = value.lastIndexOf(' ');
        if (lastspace != -1) {
          value = value.substr(0, lastspace);
        }
      }

      return value + (tail || '…');
    };
  })
  .filter('characters', function () {
    return function (input, chars, breakOnWord) {
      if (isNaN(chars)) return input;
      if (chars <= 0) return '';
      if (input && input.length > chars) {
        input = input.substring(0, chars);

        if (!breakOnWord) {
          var lastspace = input.lastIndexOf(' ');
          //get last space
          if (lastspace !== -1) {
            input = input.substr(0, lastspace);
          }
        }else{
          while(input.charAt(input.length-1) === ' '){
            input = input.substr(0, input.length -1);
          }
        }
        return input + '…';
      }
      return input;
    };
  })
  .filter('splitcharacters', function() {
    return function (input, chars) {
      if (isNaN(chars)) return input;
      if (chars <= 0) return '';
      if (input && input.length > chars) {
        var prefix = input.substring(0, chars/2);
        var postfix = input.substring(input.length-chars/2, input.length);
        return prefix + '...' + postfix;
      }
      return input;
    };
  })
  .filter('words', function () {
    return function (input, words) {
      if (isNaN(words)) return input;
      if (words <= 0) return '';
      if (input) {
        var inputWords = input.split(/\s+/);
        if (inputWords.length > words) {
          input = inputWords.slice(0, words).join(' ') + '…';
        }
      }
      return input;
    };
  })
  .filter("trusted_html", ['$sce', function ($sce) {
    return function (code) {
      return $sce.trustAsHtml(code);
    };
  }])
  .filter("trusted_url", ['$sce', function ($sce) {
    return function (url) {
      return $sce.trustAsResourceUrl(url);
    };
  }])
  .filter("str_pad", function(){
    return function(input, padString, padLength, rightToLeft){
      if(!rightToLeft){
        rightToLeft = false;
      }
      var pad = "";
      for(var i=0; i<padLength; i++){
        pad += padString;
      }

      return rightToLeft ? (input + pad).slice(0, padLength) : (pad + input).slice(-1 * pad.length);
    }
  })
