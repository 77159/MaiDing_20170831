/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/9/28
 * @describe 时间计算器
 */
'use strict';

import React from 'react';

//antd ui
import {Slider, Button, Icon} from 'antd';

//css
import styles from './index.less';

//工具类
import _ from 'lodash';

export default class PlayerPanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            palySliderValue: 3,
            startValue: null
        }
    }


    componentWillReceiveProps(nextPorps) {

    }


    render() {
        // const startValue = this.props.startValue;
        // const endValue = this.props.endValue;
        //
        // if (startValue) {
        //     console.log('this.props.startValue', startValue.format('YYYY-MM-DD'), startValue.format('YYYY-MM-DD'));
        // }
        //
        // if (endValue) {
        //     console.log('this.props.startValue', endValue.format('YYYY-MM-DD'));
        // }
        //
        // console.log('this.props.startValue', startValue.format('YYYY-MM-DD'), this.props.startValue.format('HH-mm-ss'));
        // console.log('this.props.endValue', endValue);
        //
        // console.log('this.props.startValue', this.props.startValue);


        return (
            <div className={styles.replayPanel}>
                <div className={styles.replayItemRow}>
                    <div className={styles.playTimeTag}>
                        <span>00:12</span><span> / 1:20:22</span>
                    </div>
                    <span className={styles.speedTag}>快进×16</span>
                </div>
                <Slider min={0} max={10} className={styles.palySlider} onChange={this.onPalySliderChange}
                        value={this.state.palySliderValue} step={0.01}/>
                <div className={styles.replayItemRow}>
                    <div>
                        <span>2017-9-13<br/>12:39:28</span>
                    </div>
                    <div className={styles.ctlButtons}>
                        <Button ghost size="large"><Icon type="pause-circle"/></Button>
                        <Button ghost size="large"><Icon type="forward"/></Button>
                        <Button ghost size="large"><Icon type="minus-square"/></Button>
                    </div>
                    <div>
                        <span>2017-10-22<br/>18:39:28</span>
                    </div>
                </div>
            </div>
        )
    }
};