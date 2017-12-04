/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/9/13
 * @describe 区域设置表单
 */

'use strict';

import React from 'react';

//css
import styles from './index.less';

//antd-ui
import {Form} from 'antd';
import {Button, Input, InputNumber, Slider, Select, Checkbox} from 'antd';

//action
import {
    createArea,
    modifyArea,
    lockForm,
    emptyAreaForm
} from './actions';

//redux
import {connect} from 'react-redux';

//select
import {
    SelectorArea,
    SelectorLock,
    SelectorPoints
} from './selectors';

import {Row, Col} from 'antd';

import {createStructuredSelector} from 'reselect';

import {showErrorMessage} from "../App/actions";

//正则验证
import {appRegExp} from "../../utils/validation";

const {Option} = Select;
const FormItem = Form.Item;

const formItemLayout = {
    labelCol: {span: 8,},
    wrapperCol: {span: 16,},
};

class AreaFormPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            areaOpacity: 0,
        }
    }

    /**
     * 保存当前地图区域
     */
    saveArea = () => {
        //const form = this.props.form;
        const {areaList, form} = this.props;
        form.validateFields((err, values, a) => {
            if (err) {
                return;
            }
            const id = values.id;
            const areaStyle = values.areaStyle;
            const points = this.props.points;
            if (points) {
                values['polygon'] = JSON.stringify(points);
            }
            values['areaType'] = values['areaType'] ? 1 : 0;
            values['floorId'] = '1';    //TODO 当前只有一层楼
            values['areaStyle'] = `{"backgroundColor":"${values.areaStyle}","opacity":${values.opacity / 100}}`;
            if (!id) {
                this.props.createArea(values);
            } else {
                this.props.modifyArea(values);
            }
            //锁定表单
            this.props.lockForm();
            //更新地图polygon样式
            this.props.updatePolygonStyle({id: id, backgroundColor: areaStyle, opacity: values.opacity / 100});
            this.props.changeStatus(null);
            this.props.disposeCurrentPolygon();
            //TODO 交互问题
            window.setTimeout(() => {
                form.resetFields();
            }, 100);
        });
    };

    /**
     * 取消地图区域表单面板
     */
    cancelArea = () => {
        this.props.form.resetFields();
        this.props.cancelPolygon();
        this.props.lockForm();
    };

    /**
     * 验证区域名称是否唯一
     * @param id  区域id
     * @param rule 规则
     * @param value 当前的值
     * @param callback 需要执行的回调函数
     */
    validatorAreaName = (rule, value, callback) => {
        const areaList = this.props.areaList;
        const area = areaList.filter((item) => {
            return item.areaName === value;
        });

        if (area.length > 0) {
            callback('区域设置名称不能重复');
        }
        callback();
    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const {area, lock} = this.props;            //state

        if (area) {
            area.areaStype = JSON.parse(area.get('areaStyle'));
        }

        return (
            <div className={styles.datePanel} style={{display: lock ? 'none' : 'block'}}>
                {
                    getFieldDecorator('id', {
                        initialValue: area.get('id'),
                    })(
                        <Input type="hidden"/>
                    )
                }
                {
                    getFieldDecorator('polygon', {
                        initialValue: area.get('polygon'),
                    })(
                        <Input type="hidden"/>
                    )
                }
                <div className={styles.dtPickerItem}>
                    {/*<label className={styles.label}>区域名称</label>*/}
                    <FormItem key={'areaName'} {...formItemLayout} label="区域名称" hasFeedback={true}>
                        {
                            getFieldDecorator('areaName', {
                                rules: [{
                                    required: true,
                                    message: '区域名称不能为空'
                                }, {
                                    regexp: 'regexp',
                                    pattern: appRegExp.AREANAME,
                                    message: appRegExp.AREANAME_ERROR_MSG
                                }, {
                                    validator: this.validatorAreaName
                                }],
                                initialValue: area.get('areaName'),
                            })(
                                <Input placeholder="区域名称"/>
                            )
                        }
                    </FormItem>
                </div>
                <div className={styles.dtPickerItem}>
                    <Row>
                        <Col span={8}>
                            <label>重点区域</label>
                        </Col>
                        <Col span={16}>
                            {
                                getFieldDecorator('areaType', {
                                    valuePropName: 'checked',
                                    initialValue: area.get('areaType') === 1 ? true : false,
                                })(
                                    <Checkbox disabled={lock}>标记重点区域</Checkbox>
                                )
                            }
                        </Col>
                    </Row>
                </div>
                <div className={styles.dtPickerItem}>
                    <FormItem key={'areaStyle'} labelCol={{span: 8}} wrapperCol={{span: 16}} label="区域样式"
                              hasFeedback={true}>
                        {/*<label className={styles.label}>区域样式</label>*/}
                        {
                            getFieldDecorator('areaStyle', {
                                rules: [
                                    {
                                        required: true,
                                        message: '请选择区域样式'
                                    },
                                ],
                                initialValue: area.areaStype.backgroundColor,
                            })(
                                <Select>
                                    {/*<Select className={styles.areaStyleSelect} disabled={lock}>*/}
                                    <Option value="#2196F3" title="蓝色">
                                        <span className={styles.areaStyleBlue}></span>
                                    </Option>
                                    <Option value="#f44336" title="红色">
                                        <span className={styles.areaStyleRed}></span>
                                    </Option>
                                    <Option value="#4caf50" title="绿色">
                                        <span className={styles.areaStyleGreen}></span>
                                    </Option>
                                    <Option value="#ff5722" title="橙色">
                                        <span className={styles.areaStyleOrange}></span>
                                    </Option>
                                    <Option value="#9c27b0" title="紫色">
                                        <span className={styles.areaStyleViolet}></span>
                                    </Option>
                                    <Option value="#ffeb3b" title="黄色">
                                        <span className={styles.areaStyleYellow}></span>
                                    </Option>
                                    <Option value="#000000" title="黑色">
                                        <span className={styles.areaStyleBlack}></span>
                                    </Option>
                                </Select>
                            )
                        }
                    </FormItem>
                </div>
                <div className={styles.dtPickerItem}>
                    <Row>
                        <Col span={8}>
                            <label>不透明度</label>
                        </Col>
                        <Col span={16}>
                            {
                                getFieldDecorator('opacity', {
                                    initialValue: area.areaStype.opacity * 100,
                                })(
                                    <Slider disabled={lock} className={styles.opacitySlider} min={0} max={100}/>
                                )
                            }{
                            getFieldDecorator('opacity', {
                                initialValue: area.areaStype.opacity * 100,
                            })(
                                <InputNumber
                                    disabled={lock}
                                    min={0}
                                    max={100}
                                    step={1}
                                    formatter={value => `${value}%`}
                                    parser={value => value.replace('%', '')}
                                />
                            )
                        }
                        </Col>
                    </Row>
                </div>
                <div className={styles.areaSetPanelItem}>
                    <Button type="danger" disabled={lock} className={styles.startReplay}
                            onClick={this.saveArea}>保存</Button>
                    <Button type="danger" disabled={lock} className={styles.startReplay}
                            onClick={this.cancelArea}>取消</Button>
                </div>
            </div>
        )
    }
}

export function actionsDispatchToProps(dispatch) {
    return {
        createArea: (area) => dispatch(createArea(area)),
        modifyArea: (area) => dispatch(modifyArea(area)),
        lockForm: (area) => dispatch(lockForm()),
        emptyAreaForm: () => dispatch(emptyAreaForm()),
        showErrorMessage: (error) => dispatch(showErrorMessage(error))
    }
}

const selectorStateToProps = createStructuredSelector({
    area: SelectorArea(),
    lock: SelectorLock(),
    points: SelectorPoints()
});


export default connect(selectorStateToProps, actionsDispatchToProps)(Form.create()(AreaFormPanel));