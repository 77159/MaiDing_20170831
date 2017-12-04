/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/8/6
 * @describe 人员管理页面。路径为'/people'
 */
'use strict';
import React from 'react';

//antd UI
import {Layout, Icon, Button} from 'antd';
import {Row, Col} from 'antd';
import {Modal} from 'antd';
import {Form} from 'antd';
import {Input} from 'antd';

//css
import styles from './index.less';

//redux
import {connect} from 'react-redux';
import {createStructuredSelector} from 'reselect';

//actions
import {
    getPeopleCategory,
    deletePeopleCategory,
    getPeopleCategoryById,
    postPeopleCategory,
    getPeopleCategoryParentById,
    putPeopleCategory,
    emptyPeopleCategoryId,
    updatePeopleCategoryName,
    updatePeopleLevelName
} from './actions';

//store
import {
    peopleCategorySourceSelector,
    parentIdSelector,
    parentNameSelector,
    operationRunningSelector,
    nameSelector,
    idSelector
} from './selectors';

//自定义组件
import {CategorySubMenu} from '../../components/CategorySubMenu'

//正则验证
import {appRegExp} from "../../utils/validation";

const {Content} = Layout;
const FormItem = Form.Item;

const formItemLayout = {
    labelCol: {span: 17, offset: 3},
    wrapperCol: {span: 17, offset: 3},
};

const formItemLayout2 = {
    labelCol: {span: 0},
    wrapperCol: {span: 24},
};

class CategoryFormModel extends React.Component {
    constructor(props) {
        super(props);
    };

    /**
     * 加载所有人员类型
     */
    componentDidMount() {
        this.props.getPeopleCategory();
    };

    /**
     * 创建人员类别
     */
    createPeopleCategory = () => {
        this.props.emptyPeopleCategoryId();
        this.props.changePostFormType('category');
        this.props.updatePeopleLevelName('');
    };

    /**
     * 创建人员级别
     * @param pid   父级人员类型
     */
    createPeopleLevel = (pid) => {
        this.props.changePostFormType('level');
        this.props.emptyPeopleCategoryId();
        this.props.getPeopleCategoryParentById(pid);
        this.props.updatePeopleLevelName('');
    };

    /**
     * 根据人员类型id更新人员类型
     * @param id    人员类型id
     * @param type  当前添加的人员类型/级别
     */
    modifyPeopleCategory = (id, type) => {
        if (id) {
            this.props.changePostFormType(type);
            this.props.getPeopleCategoryById(id);
        }
    };

    /**
     * 根据人员类型id删除人员类型
     * @param id    人员类型id
     */
    deletePeopleCategory = (id, type) => {
        if (id) {
            if (type === 'category') {
                this.props.changePostFormType('category');
            }
            this.props.updatePeopleLevelName('');
            this.props.emptyPeopleCategoryId();
            this.props.deletePeopleCategory(id);
        }
    };

    /**
     * 创建人员类型
     * @param peopleCategory 人员类型实体
     */
    handlePostPeopleCategory = (peopleCategory) => {
        const category = this.props.peopleCategory;
        if (peopleCategory) {
            const id = this.props.id;
            const name = peopleCategory.name;
            if (id) {
                peopleCategory['id'] = id;
                if (peopleCategory.parentId === -1) {
                    this.props.updatePeopleLevelName(peopleCategory.name);
                } else {
                    this.props.updatePeopleCategoryName(peopleCategory.parentName);
                    this.props.updatePeopleLevelName(peopleCategory.name);
                }
                this.props.putPeopleCategory(peopleCategory);
            } else {
                this.props.postPeopleCategory(peopleCategory);
            }
        }
    };


    render() {
        const {form} = this.props;
        const {peopleCategory, operationRunning} = this.props;
        const {postVisible, postFormType} = this.props;
        const {pid, parentName, name} = this.props;

        return (
            <Modal
                title={<span><Icon type="user-add"/>设置人员类别</span>}
                visible={postVisible}
                onCancel={this.props.closePostSettingModal}
                footer={null}
                width={640}
                className={styles.redModal}>
                <Row type="flex">
                    <Col span={8} className={styles.leftCol}>
                        <Layout>
                            <div className={styles.headTitle}>
                                <label>人员类别</label>
                                <Button size="small" title="添加类别" onClick={this.createPeopleCategory}>添加类别</Button>
                            </div>
                            <Content>
                                {/*树形菜单*/}
                                <CategorySubMenu
                                    peopleCategory={peopleCategory}                     //数据源
                                    createPeopleLevel={this.createPeopleLevel}          //创建
                                    modifyPeopleCategory={this.modifyPeopleCategory}    //修改
                                    deletePeopleCategory={this.deletePeopleCategory}    //删除
                                />
                            </Content>
                        </Layout>
                    </Col>
                    <Col span={16} className={styles.rightCol}>
                        <CategoryForm
                            form={form}
                            postFormType={postFormType}
                            closePostSettingModal={this.props.closePostSettingModal}
                            handlePostPeopleCategory={this.handlePostPeopleCategory}
                            pid={pid}
                            parentName={parentName}
                            name={name}
                            operationRunning={operationRunning}
                            peopleCategory={peopleCategory}
                        />
                    </Col>
                </Row>
            </Modal>
        )
    }
}

//人员二级类型表单
class CategoryForm extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * 保存人员类型
     */
    savePeopleCategory = () => {
        const form = this.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            this.props.handlePostPeopleCategory(values);
            form.resetFields();
        });
    };

    /**
     * 类别名称不能重复
     * @param rule
     * @param value
     * @param callback
     */
    validatorCategoryName = (rule, value, callback) => {
        const peopleCategory = this.props.peopleCategory;

        const categoryFilter = peopleCategory.filter((item) => {
            return item.name === value;
        });
        if (categoryFilter.length > 0) {
            callback('类别名称不能重复');
        }
        callback();
    };

    /**
     * 级别名称重复验证
     * @param rule
     * @param value
     * @param callback
     */
    validatorChildrenName = (rule, value, callback) => {
        let flag = false;
        const peopleCategory = this.props.peopleCategory;
        for (let i = 0; i < peopleCategory.length; i++) {
            if (peopleCategory[i].id === this.props.pid) {
                const children = peopleCategory[i].childrenList;
                for (let i = 0; i < children.length; i++) {
                    if (children[i].name === value) {
                        flag = true;
                        break;
                    }
                }
                if (flag) {
                    break;
                }
            }
        }

        if (flag) {
            callback('级别名称不能重复');
        }
        callback();
    };

    /**
     * 获取表单面板
     * @param postFormType
     * @returns {Array}
     */
    getFormPanel = (postFormType) => {
        const {getFieldDecorator} = this.props.form;
        let formPanel = [];

        if (postFormType !== 'none') {
            if (postFormType === 'level') {
                formPanel.push(<FormItem key={'parentId'} {...formItemLayout}>
                    {getFieldDecorator('parentId', {
                        initialValue: this.props.pid
                    })(
                        <Input type="hidden"/>
                    )}
                </FormItem>);
                formPanel.push(<FormItem key={'parentName'} {...formItemLayout} label="类别名称" hasFeedback={true}>
                    {getFieldDecorator('parentName', {
                        rules: [{
                            required: true,
                            message: '请输入类别名称',
                        }, {
                            regexp: 'regexp',
                            pattern: appRegExp.PERSON_CATEAGORY_NAME,
                            message: appRegExp.PERSON_CATEAGORY_NAME_ERROR_MSG
                        }, {
                            validator: null
                        }],
                        initialValue: this.props.parentName,
                    })(
                        <Input maxLength="10" disabled={postFormType === "category" ? false : true}/>
                    )}
                </FormItem>)
            } else {
                formPanel.push(<FormItem key={'parentId'} {...formItemLayout}>
                    {getFieldDecorator('parentId', {
                        initialValue: -1
                    })(
                        <Input type="hidden"/>
                    )}
                </FormItem>);
                formPanel.push(<FormItem key={'name'} {...formItemLayout} label="类别名称" hasFeedback={true}>
                    {getFieldDecorator('name', {
                        rules: [{
                            required: true,
                            message: '请输入类别名称',
                        }, {
                            regexp: 'regexp',
                            pattern: appRegExp.PERSON_CATEAGORY_NAME,
                            message: appRegExp.PERSON_CATEAGORY_NAME_ERROR_MSG
                        }, {
                            validator: this.validatorCategoryName
                        }],
                        initialValue: this.props.name,
                    })(
                        <Input maxLength="10" disabled={postFormType === "category" ? false : true}/>
                    )}
                </FormItem>)
            }
        }
        if (postFormType === 'level') {
            formPanel.push(<FormItem key={'name'} {...formItemLayout} label="级别名称" hasFeedback={true}>
                {getFieldDecorator('name', {
                    rules: [{
                        required: true,
                        message: '请输入级别名称',
                    }, {
                        regexp: 'regexp',
                        pattern: appRegExp.PERSON_CATEAGORY_NAME,
                        message: appRegExp.PERSON_LEVEL_NAME_ERROR_MSG
                    }, {
                        validator: this.validatorChildrenName
                    }],
                    initialValue: this.props.name,

                })(
                    <Input maxLength="10"/>
                )}
            </FormItem>);
        }

        return formPanel;
    };

    /**
     * 获取按钮面板
     * @param postFormType
     * @returns {*}
     */
    getButtonPanel = (postFormType) => {
        let buttonPanel = null;

        if (postFormType !== 'none') {
            buttonPanel = <FormItem {...formItemLayout2} style={{textAlign: 'center'}}>
                <Button key="submit" type="primary" loading={this.props.operationRunning} size="large"
                        onClick={this.savePeopleCategory}
                        style={{
                            margin: '0px 15px 0px 0px',
                            width: '110px'
                        }}>保存</Button>
                <Button key="back" size="large"
                        onClick={this.props.closePostSettingModal}
                        style={{margin: '0px 15px 0px 0px', width: '110px'}}>
                    取消
                </Button>
            </FormItem>
        }
        return buttonPanel;
    };


    render() {
        const {postFormType} = this.props;

        const FormPanel = this.getFormPanel(postFormType);
        const buttonPanel = this.getButtonPanel(postFormType);

        return (
            <Form layout="vertical">
                <FormItem {...formItemLayout}>
                </FormItem>
                <FormItem {...formItemLayout}>
                </FormItem>
                {FormPanel}
                <FormItem {...formItemLayout}>
                </FormItem>
                {buttonPanel}
                <FormItem {...formItemLayout}>
                </FormItem>
                <FormItem {...formItemLayout}>
                </FormItem>
            </Form>
        )
    }
}

export function actionsDispatchToProps(dispatch) {
    return {
        getPeopleCategory: () => dispatch(getPeopleCategory()),
        deletePeopleCategory: (id) => dispatch(deletePeopleCategory(id)),
        getPeopleCategoryById: (id) => dispatch(getPeopleCategoryById(id)),
        postPeopleCategory: (model) => dispatch(postPeopleCategory(model)),
        getPeopleCategoryParentById: (id) => dispatch(getPeopleCategoryParentById(id)),
        putPeopleCategory: (model) => dispatch(putPeopleCategory(model)),
        emptyPeopleCategoryId: () => dispatch(emptyPeopleCategoryId()),
        updatePeopleCategoryName: (parentName) => dispatch(updatePeopleCategoryName(parentName)),
        updatePeopleLevelName: (name) => dispatch(updatePeopleLevelName(name)),
    }
}

const selectorStateToProps = createStructuredSelector({
    peopleCategory: peopleCategorySourceSelector(),
    pid: parentIdSelector(),
    parentName: parentNameSelector(),
    operationRunning: operationRunningSelector(),
    name: nameSelector(),
    id: idSelector(),
});

export default connect(selectorStateToProps, actionsDispatchToProps)(Form.create()(CategoryFormModel));