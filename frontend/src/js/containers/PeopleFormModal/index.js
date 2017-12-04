/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/6
 * @describe 人员管理页面 添加人员信息框组件，可支持添加、修改、查看功能。路径为'/people'
 */

'use strict';
import React from 'react';
import {Layout, Menu, Icon} from 'antd';
import {Button} from 'antd';
import {Modal} from 'antd';
import {Input} from 'antd';
import {InputNumber} from 'antd';
import {Cascader} from 'antd';
import {Checkbox} from 'antd';
import {Select} from 'antd';
import {Row, Col} from 'antd';
import {Table} from 'antd';
import {Form} from 'antd';
import styles from './index.less';
import {connect} from 'react-redux';
import _ from 'lodash';
import {createStructuredSelector} from 'reselect';
import {peopleEntitySelector, modalVisibleSelector, operationRunningSelector, operationSelector, imgURLSelector} from './selectors';
import {peopleCategorySourceSelector} from '../CategoryFormModel/selectors';
import {notDeviceDataSourceSelector} from '../DeviceMgrPage/selectors';
import {peopleFormModalHide, getImgUrl} from "./actions";
import {appRegExp} from "../../utils/validation";
import {PeopleAvatar} from '../../components/PeopleAvatar';
import {createPeople, modifyPeople} from "../PeopleMgrPage/actions";
import {queryAllNotDeviceBegin} from "../DeviceMgrPage/actions";
import {AppConfig} from '../../core/appConfig';
const serviceUrl = AppConfig.serviceUrl;
const FormItem = Form.Item;
const Option = Select.Option;

const formItemLayout = {
    labelCol: {span: 6},
    wrapperCol: {span: 16},
};
const formItemLayout2 = {
    labelCol: {span: 0},
    wrapperCol: {span: 24, offset: 6},
};
const formItemLayout3 = {
    labelCol: {span: 6, offset: 6},
    wrapperCol: {span: 12},
};
const formItemLayout4 = {
    labelCol: {span: 5, offset: 4},
    wrapperCol: {span: 14},
};
const formItemLayout5 = {
    labelCol: {span: 0},
    wrapperCol: {span: 16, offset: 6},
};
const formItemLayout6 = {
    labelCol: {span: 6},
    wrapperCol: {span: 24},
};

class PeopleFormModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            peopleCategory: [],  //人员类别、级别集合
            notDeviceDataSource: [],
        };
    }

    componentDidMount() {
        this.props.queryAllNotDeviceBegin();
    }

    //状态更新后的变化
    componentWillReceiveProps(nextProps) {
        //当人员类别数据更新时，更新当前组件的state中对人员类别的缓存数据
        if (_.eq(this.props.peopleCategory, nextProps.peopleCategory) == false) {
            this.deepClonePeopleCategory(nextProps.peopleCategory)
        }

        if (!this.props.peopleEntity && !nextProps.peopleEntity) {
            this.props.getImgUrl('');
        } else if (((!this.props.peopleEntity) && nextProps.peopleEntity.avatarImgPath) ||
            this.props.peopleEntity.avatarImgPath !== nextProps.peopleEntity.avatarImgPath) {
            this.props.getImgUrl(nextProps.peopleEntity.avatarImgPath || '');
        }

        //判断上一次的数据和此时的数据是否一致
        if (!this.props.peopleEntity && !nextProps.peopleEntity) {
            this.props.form.resetFields();
        } else if (((!this.props.peopleEntity) && nextProps.peopleEntity) || this.props.peopleEntity !== nextProps.peopleEntity) {
            this.props.form.resetFields();
        }

    };


    //将人员类别数据进行深拷贝，修改结构后存储到当前组件的state中
    deepClonePeopleCategory = (orginPeopleCategory) => {
        //复制人员类别数据，改变对象结构
        if (_.isArray(orginPeopleCategory)) {
            let tmpPeopleCategory = [];
            orginPeopleCategory.forEach((item) => {
                //创建类别
                let cagetoryItem = {
                    value: item.id + '',
                    label: item.name + '',
                };
                //循环人员类别下的职位集合
                if (item.childrenList) {
                    let categoryChildren = [];
                    item.childrenList.forEach((childenItem) => {
                        categoryChildren.push({
                            value: childenItem.id + '',
                            label: childenItem.name + '',
                            parentId: childenItem.parentId + ''
                        });
                    });
                    cagetoryItem.children = categoryChildren;
                }
                tmpPeopleCategory.push(cagetoryItem);
            });
            this.setState({peopleCategory: tmpPeopleCategory});
        }
    };

    //取消
    onCancel = () => {
        this.props.form.resetFields();
        if (this.props.operation === 'create') {
            this.props.getImgUrl('');
        } else {
            this.props.getImgUrl(this.props.peopleEntity.avatarImgPath);
        }
        this.props.hideModal();
    };

    //添加
    onAdd = () => {
        const form = this.props.form;
        const imgURL = this.props.imgURL;
        form.validateFields((err, values) => {
            if (err) {
                this.setState({visible: false, confirmLoading: false});
                return;
            }
            values['keyArea'] = values.keyArea ? 1 : 0;
            values['sex'] = values.sex + '';
            values['age'] = values.age + '';
            if (_.isArray(values.postType)) {
                const postTypeObj = values.postType;
                const postType = postTypeObj[0];
                const postLevel = postTypeObj[1];
                values['postType'] = postType;
                values['postLevel'] = postLevel;
            }
            values['avatarImgPath'] = imgURL;
            this.props.createPeople(values);
            //form.resetFields();
            this.props.getImgUrl('');
        });
    };

    //修改
    onSave = () => {
        const form = this.props.form;
        let imgURL = this.props.imgURL;

        form.validateFields((err, values) => {
            if (err) {
                this.setState({visible: false, confirmLoading: false});
                return;
            }
            values['keyArea'] = values.keyArea ? 1 : 0;
            values.sex = values.sex + '';
            values['age'] = values.age + '';
            if (_.isArray(values.postType)) {
                const postTypeObj = values.postType;
                const postType = postTypeObj[0];
                const postLevel = postTypeObj[1];
                values['postType'] = postType;
                values['postLevel'] = postLevel;
            }
            values['avatarImgPath'] = imgURL;
            const personCode = values.personCode;
            this.props.modifyPeople(values);
            //form.resetFields();
            // this.props.getImgUrl('');
            this.props.getImgUrl(this.props.peopleEntity.avatarImgPath);
        });


    };

    render() {
        const {getFieldDecorator} = this.props.form;
        const {visible, onCancel, onAdd, confirmLoading, loading, form, onSave} = this.props;
        const {modalVisible, operation, peopleEntity, operationRunning, peopleCategory, notDeviceDataSource} = this.props;
        const opText = (operation === 'create') ? '添加人员' : '编辑人员信息';
        const determine = (operation === 'create') ? '添加' : '保存';
        const switchBtn = (operation === 'create') ? this.onAdd : this.onSave;
        const sex = (operation === 'create') ? '0' : ((peopleEntity.sex === 0) ? '0' : '1');
        const age = (operation === 'create') ? '25' : peopleEntity.age;
        const isShow = (operation === 'create') ? false : true;
        let notDevice;

        if (notDeviceDataSource) {
            notDevice = notDeviceDataSource.map((item, index) => {
                return (
                    <Option key={index} value={item}>{item}</Option>
                )
            });
        }

        let isShowImg, tempImgSrc = this.props.imgURL === '' ? '' : `${serviceUrl}${this.props.imgURL}`;
        isShowImg = <PeopleAvatar getImgUrl={this.props.getImgUrl} imgURL={tempImgSrc}/>;

        return (
            <Modal
                title={<span><Icon type="user-add"/>{opText}</span>}
                visible={modalVisible}
                onOk={this.onAdd}
                onCancel={this.onCancel}
                confirmLoading={confirmLoading}
                footer={null}
                width={640}
                className={styles.redModal}
            >
                <Form layout="horizontal">
                    <Row gutter={20} type="flex">
                        <Col span={8}>
                            {isShowImg}
                        </Col>
                        <Col span={16}>
                            <FormItem label="安保编号" {...formItemLayout} hasFeedback={true} colon={false}>
                                {getFieldDecorator('personCode', {
                                    rules: [{
                                        required: true,
                                        regexp: 'regexp',
                                        pattern: appRegExp.PERSONCODE,
                                        message: appRegExp.PERSONCODE_ERROR_MSG,
                                        min: 3,
                                        max: 15,
                                    }],
                                    initialValue: peopleEntity.personCode
                                })(
                                    <Input disabled={isShow} maxLength="30"/>
                                )}
                            </FormItem>
                            <FormItem label="安保姓名" {...formItemLayout} hasFeedback={true} colon={false}>
                                {getFieldDecorator('personName', {
                                    rules: [{
                                        required: true,
                                        regexp: 'regexp',
                                        pattern: appRegExp.PERSONNAME,
                                        message: appRegExp.PERSONNAME_ERROR_MSG,
                                        min: 2,
                                        max: 4,
                                    }],
                                    initialValue: peopleEntity.personName
                                })(
                                    <Input maxLength="10"/>
                                )}
                            </FormItem>
                            <Row>
                                <Col span={12}>
                                    <FormItem
                                        {...formItemLayout3}
                                        label="性别"
                                        colon={false}
                                    >
                                        {getFieldDecorator('sex', {
                                            rules: [{required: true, message: '请选择性别'}],
                                            initialValue: [sex]
                                        })(
                                            <Select>
                                                <Option value="0">男</Option>
                                                <Option value="1">女</Option>
                                            </Select>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={12}>
                                    <FormItem label="年龄" {...formItemLayout4} colon={false}>
                                        {getFieldDecorator('age', {initialValue: [age]})(
                                            <InputNumber min={16} max={99}
                                                         className={styles.ageInput}/>
                                        )}
                                    </FormItem>
                                </Col>
                            </Row>

                            <FormItem
                                {...formItemLayout}
                                label="人员类别"
                                colon={false}
                            >
                                {getFieldDecorator('postType', {
                                    rules: [{
                                        required: true,
                                        type: 'array',
                                        message: '请选择人员类别与级别'
                                    }],
                                    initialValue: [peopleEntity.postType, peopleEntity.postLevel]
                                })(
                                    <Cascader placeholder="请选择人员类别与级别" options={this.state.peopleCategory}
                                              expandTrigger="hover"/>
                                )}
                            </FormItem>

                            <FormItem
                                {...formItemLayout}
                                label="设备编号"
                                colon={false}
                            >
                                {getFieldDecorator('deviceCode', {
                                    //rules: [{required: true, message: '请选择设备'}],
                                    initialValue: peopleEntity.deviceCode
                                })(
                                    <Select allowClear={true}>
                                        <Option key={'\n'}>不选择任何设备</Option>
                                        {notDevice}
                                    </Select>
                                )}
                            </FormItem>

                            <FormItem label="联系方式" {...formItemLayout} hasFeedback={true} colon={false}>
                                {getFieldDecorator('contact', {
                                    rules: [{message: '请输入正确的联系方式'}],
                                    initialValue: peopleEntity.contact
                                })(
                                    <Input maxLength="20"/>
                                )}
                            </FormItem>

                            <FormItem label="备注" {...formItemLayout} hasFeedback={true} colon={false}>
                                {getFieldDecorator('remark', {
                                    rules: [{message: '请输入正确的格式'}],
                                    initialValue: peopleEntity.remark
                                })
                                (<Input type="textarea" maxLength="250"/>)}
                            </FormItem>

                            <FormItem {...formItemLayout5} required={true} colon={false}>
                                {getFieldDecorator('keyArea', {
                                    valuePropName: 'checked',
                                    initialValue: Boolean(peopleEntity.keyArea),
                                })(
                                    <Checkbox className={styles.peopleChk}>允许进入重点区域</Checkbox>
                                )}
                            </FormItem>
                        </Col>
                    </Row>
                    <Row gutter={20}>
                        <Col span={24}>
                            <FormItem {...formItemLayout2}>
                                <Button key="submit" type="primary"
                                        loading={operationRunning} size="large"
                                        onClick={switchBtn}
                                        style={{margin: '0px 10px', width: '120px'}}>
                                    {determine}
                                </Button>
                                <Button key="back" size="large" onClick={this.onCancel}
                                        style={{margin: '0px 10px', width: '120px'}}>
                                    取消
                                </Button>
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        );
    }

}

export function actionsDispatchToProps(dispatch) {
    return {
        hideModal: () => dispatch(peopleFormModalHide()),
        createPeople: (peopleEntity) => dispatch(createPeople(peopleEntity)),
        modifyPeople: (peopleEntity) => dispatch(modifyPeople(peopleEntity)),
        queryAllNotDeviceBegin: () => dispatch(queryAllNotDeviceBegin()),
        getImgUrl: (imgURL) => dispatch(getImgUrl(imgURL))
    };
}

const selectorStateToProps = createStructuredSelector({
    modalVisible: modalVisibleSelector(),
    operation: operationSelector(),
    operationRunning: operationRunningSelector(),
    peopleEntity: peopleEntitySelector(),
    peopleCategory: peopleCategorySourceSelector(),
    notDeviceDataSource: notDeviceDataSourceSelector(),
    imgURL: imgURLSelector()
});

export default connect(selectorStateToProps, actionsDispatchToProps)(Form.create()(PeopleFormModal));
