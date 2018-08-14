app.directive ('accountUpdateModal', ['userService', function (userService) {
  return {
    restrict: 'E',
    templateUrl:'directives/partials/account-update.html',

    link: function(scope, elem, attrs){
      scope.lengthError = false;
      scope.updateError = false;
      scope.confirmPwdChange = function() {
        var newPwdConfirm = scope.newPwdConfirm || '';
        var userPwd = scope.userPwd || '';
        var userName = scope.userName || '';
        var newPwd = scope.newPwd || '';
        if (newPwd.length < 6 || newPwdConfirm.length < 6) scope.lengthError = true;
        else scope.lengthError = false;
        if (!scope.passPwdUpdate()) return;     // Check all conditions required for creating the account
        console.log ('updating account:' + userName + newPwd);

        userService.updateAccount (userName, userPwd, newPwd, function (data) {
         if (data != 'false') {
           console.log ('user update return message: ' + data);
           var message = 'Your account has been updated! Please keep your user ID and password safe,';
           message += 'as password reset can take up to two weeks if you lose it.  Your login will be the only way to access your ';
           message += 'gym reservation information.';
              alert (message);
           $('#pwd-update-modal').foundation('reveal', 'close');
         }
         else {
           console.log ('Update err');
           // Service returned a result that says the requested user already exists.
           scope.updateError = true;
         }    
       });    

     
      }

      scope.passPwdUpdate = function () {
        console.log ('a');
        var newPwdConfirm = scope.newPwdConfirm;
        var userPwd = scope.userPwd;
        var userName = scope.userName;
        var newPwd = scope.newPwd;
        var result = (typeof userName != "undefined" &&
               typeof userPwd != "undefined" &&
               typeof newPwd != "undefined" &&
               userName.length >= 6 &&
               userPwd.length >= 5 && 
               newPwd.length >= 6 &&
               typeof newPwdConfirm != "undefined" && 
               newPwdConfirm.length != 0 && 
               newPwd == newPwdConfirm);
        console.log (result);
        return result;
      }
     
    }
  }
  }]);
