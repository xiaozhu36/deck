'use strict';

const angular = require('angular');

export const ALICLOUD_SERVERGROUP_CAPACITY_DIRECTIVE = 'spinnaker.alicloud.serverGroup.configure.wizard.capacity.selector.directive';
angular
  .module(ALICLOUD_SERVERGROUP_CAPACITY_DIRECTIVE, [])
  .directive('alicloudServerGroupCapacitySelector', function() {
    return {
      restrict: 'E',
      templateUrl: require('./capacitySelector.directive.html'),
      scope: {},
      bindToController: {
        command: '=',
      },
      controllerAs: 'cap',
      controller: 'alicloudServerGroupCapacitySelectorCtrl',
    };
  })
  .controller('alicloudServerGroupCapacitySelectorCtrl', function() {});






