'use strict';

const angular = require('angular');
import * as _ from 'lodash';

import { InfrastructureCaches, TaskExecutor, FirewallLabels } from '@spinnaker/core';

export const ALICLOUD_SECURITY_WRITE_SERVICE = 'spinnaker.alicloud.securityGroup.write.service';
angular
  .module(ALICLOUD_SECURITY_WRITE_SERVICE , [require('@uirouter/angularjs').default])
  .factory('alicloudSecurityGroupWriter', function() {
    function upsertSecurityGroup(securityGroup: any, application: any, descriptor: any, params: any= {}) {
      params.securityGroupName = securityGroup.name;

      // We want to extend params with all attributes from securityGroup, but only if they don't already exist.
      _.assignWith(params, securityGroup, function(value: any, other: any) {
        return _.isUndefined(value) ? other : value;
      });

      const operation = TaskExecutor.executeTask({
        job: [params],
        application: application,
        description: `${descriptor} ${FirewallLabels.get('Firewall')}: ${securityGroup.name}`,
      });

      InfrastructureCaches.clearCache('securityGroup');

      return operation;
    }

    function deleteSecurityGroup(securityGroup: any, application: any, params: any = {}) {
      params.type = 'deleteSecurityGroup';
      params.securityGroupName = securityGroup.name;
      params.regions = [securityGroup.region];
      params.credentials = securityGroup.accountId;
      params.appName = application.name;

      const operation = TaskExecutor.executeTask({
        job: [params],
        application: application,
        description: `Delete ${FirewallLabels.get('Firewalls')}: ${securityGroup.name}`,
      });

      InfrastructureCaches.clearCache('securityGroup');

      return operation;
    }

    return {
      deleteSecurityGroup: deleteSecurityGroup,
      upsertSecurityGroup: upsertSecurityGroup,
    };
  });
