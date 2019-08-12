'use strict';

const angular = require('angular');

import { SERVER_GROUP_WRITER, TaskMonitor } from '@spinnaker/core';

module.exports = angular
  .module('spinnaker.alicloud.serverGroup.details.rollback.controller', [
    SERVER_GROUP_WRITER,
    require('../../../common/footer.directive').name,
  ])
  .controller('alicloudRollbackServerGroupCtrl', [
    '$scope',
    '$uibModalInstance',
    'serverGroupWriter',
    'application',
    'serverGroup',
    'disabledServerGroups',
    function($scope: any, $uibModalInstance: any, serverGroupWriter: any, application: any, serverGroup: any, disabledServerGroups: any) {
      $scope.serverGroup = serverGroup;
      $scope.disabledServerGroups = disabledServerGroups
        .filter((disabledServerGroup: any) => disabledServerGroup.instanceCounts.total !== 0)
        .sort((a: any, b: any) => b.name.localeCompare(a.name));
      $scope.verification = {};

      $scope.command = {
        rollbackType: 'EXPLICIT',
        rollbackContext: {
          rollbackServerGroupName: serverGroup.name,
          enableAndDisableOnly: true,
        },
      };

      this.isValid = function() {
        const command = $scope.command;
        if (!$scope.verification.verified) {
          return false;
        }

        return command.rollbackContext.restoreServerGroupName !== undefined;
      };

      $scope.taskMonitor = new TaskMonitor({
        application: application,
        title: 'Rollback ' + serverGroup.name,
        modalInstance: $uibModalInstance,
      });

      this.rollback = function() {
        this.submitting = true;
        if (!this.isValid()) {
          return;
        }

        const submitMethod = function() {
          $scope.command.interestingHealthProviderNames = [];
          const restoreServerGroup: any = $scope.disabledServerGroups.find(function(disabledServerGroup: any) {
            return disabledServerGroup.name === $scope.command.rollbackContext.restoreServerGroupName;
          });
          $scope.command.targetSize = restoreServerGroup.capacity.max;
          return serverGroupWriter.rollbackServerGroup(serverGroup, application, $scope.command);
        };

        $scope.taskMonitor.submit(submitMethod);
      };

      this.cancel = function() {
        $uibModalInstance.dismiss();
      };
    },
  ]);
