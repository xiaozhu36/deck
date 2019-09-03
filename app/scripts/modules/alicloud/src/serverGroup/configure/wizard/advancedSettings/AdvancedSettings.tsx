import * as React from 'react';
import Select, { Option } from 'react-select';

export class AdvancedSettings extends React.Component {
  private mutiazpolicy = [{
    value: 'PRIORITY',
    label: 'PRIORITY'
  }, {
    value: 'COST_OPTIMIZED',
    label: 'COST_OPTIMIZED'
  }, {
    value: 'BALANCE',
    label: 'BALANCE'
  }];

  private scalingPolicy = [{
    value: 'recycle',
    label: 'recycle'
  }, {
    value: 'release',
    label: 'release'
  }];

  private getmutiazpolicy = (option: Option) => {
    const { command } = this.props;
    command.scalingConfigurations.multiAZPolicy = option.value;
    this.setState({});
  };

  private getscalingPolicy = (option: Option) => {
    const { command } = this.props;
    command.scalingConfigurations.scalingPolicy = option.value;
    this.setState({});
  };

  public render(): React.ReactElement {
    const { command } = this.props;

    return (
      <div className="form-horizontal">
        <div className="form-group">
          <div className="form-group">
            <div className="col-md-3 sm-label-right">
              <label className="sm-label-right"> MultiAZPolicy </label>
            </div>
            <div className="col-md-3">
              <Select
                clearable={false}
                value={!!command.scalingConfigurations.multiAZPolicy}
                options={this.mutiazpolicy}
                onChange={this.getmutiazpolicy}
              />
            </div>
            <div className="col-md-6 form-inline">
              <label className="sm-label-right">
                ScalingPolicy
              </label>
              <Select
                clearable={false}
                value={!!command.scalingConfigurations.scalingPolicy}
                options={this.scalingPolicy}
                onChange={this.getscalingPolicy}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
