import * as React from 'react';
import { alicloudServerGroupAdvancedSettingsSelector } from './AdvancedSettings';

import { HelpField, IServerGroupCommand, SpelNumberInput } from '@spinnaker/core';

export class AdvanceSelector extends React.Component {

  public render() {
    const { command } = this.props;

    return (
      <div className="row">
        <div className="col-md-12">
          <alicloudServerGroupAdvancedSettingsSelector command={command} />
        </div>
      </div>
    )
  }
}
