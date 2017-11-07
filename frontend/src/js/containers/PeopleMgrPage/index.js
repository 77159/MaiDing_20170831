/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/6
 * @describe 人员管理页面。路径为'/people'
 */

'use strict';
import React from 'react';
import {Layout, Menu, Icon} from 'antd';
import {Button} from 'antd';
import {Popconfirm} from 'antd';

const {Content} = Layout;
import {Input} from 'antd';
import {Row, Col} from 'antd';
import {Table} from 'antd';
import {Avatar} from 'antd';
import {AutoComplete} from 'antd';
import {Popover} from 'antd';
import _ from 'lodash';

import {AppConfig} from '../../core/appConfig';

const serviceUrl = AppConfig.serviceUrl;

const SubMenu = Menu.SubMenu;
import styles from './index.less';

import {peopleDataSourceSelector, tableDataLoadingSelector} from './selectors';
import {createStructuredSelector} from 'reselect';
import {connect} from 'react-redux';
import {loadRepos} from '../App/actions';
import {queryAllPeopleBegin, deletePeople} from './actions';

import CategoryFormModel from '../CategoryFormModel';

//region 添加人员
import {Form} from 'antd';

import PeopleFormModal from '../PeopleFormModal';
import {peopleFormModalShow} from "../PeopleFormModal/actions";
import {peopleCategorySourceSelector} from '../CategoryFormModel/selectors';

const FormItem = Form.Item;

export class PeopleMgrPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            workState: 'all',   //工作状态 默认:全部
            curSelectedRowKeys: [],
            ModalText: 'Content of the modal',
            visible: false,
            confirmLoading: false,
            loading: false,
            postVisible: false,
            postConfirmLoading: false,
            postLoading: false,
            current: '1',
            openKeys: [],
            autoComplete_personCode: [],
            autoComplete_deviceCode: [],
            filter_deviceCode: '',
            filter_personCode: '',
            dataFilter: null,
            postFormType: 'none',
            peopleCategory: [],
        };
    }

    //加载所有人员数据
    componentDidMount() {
        this.props.queryAllPeople();
    }

    //状态更新后的变化
    componentWillReceiveProps(nextProps) {
        //当人员类别数据更新时，更新当前组件的state中对人员类别的缓存数据
        if (_.eq(this.props.peopleCategory, nextProps.peopleCategory) == false) {
            this.deepClonePeopleCategory(nextProps.peopleCategory)
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

    //重置
    onResetSearch = () => {
        this.setState({
            workState: 'all',   //工作状态 默认:全部
            curSelectedRowKeys: [],
            ModalText: 'Content of the modal',
            visible: false,
            confirmLoading: false,
            loading: false,
            postVisible: false,
            postConfirmLoading: false,
            postLoading: false,
            dataFilter: null,
            filter_deviceCode: '',
            filter_personCode: '',
            current: '1',
            openKeys: [],
            autoComplete_deviceCode: [],
            autoComplete_personCode: [],
        });

        //刷新
        this.props.queryAllPeople();
    };

    //安保编号自动完成填充
    onPersonCodeAutoCompleteSearch = (value) => {
        let peopleDataSource = this.props.peopleDataSource;
        let data = [];
        //输入字符不能为空且必须输入3个字符及以上
        if (_.isEmpty(value) == false && value.trim().length > 2) {
            //遍历所有数据，并将对应的完整数据写入自动完成提示数据集合中
            peopleDataSource.forEach(peopleEntity => {
                if (peopleEntity.personCode.includes(value)) {
                    data.push(peopleEntity.personCode);
                }
            });
        }
        this.setState({
            autoComplete_personCode: data,
        })
    };

    //设备编号自动完成填充
    onDeviceCodeAutoCompleteSearch = (value) => {
        let peopleDataSource = this.props.peopleDataSource;
        let data = [];
        //非空，且自动提示最少需要输入3个字符
        if (_.isEmpty(value) == false && value.trim().length > 2) {
            //遍历设备数据集合，将设备编号中包含输入字符的完整编号数据写入自动完成提示数据集合中。
            peopleDataSource.forEach(peopleEntity => {
                if (peopleEntity.deviceCode) {
                    if (peopleEntity.deviceCode.includes(value)) {
                        data.push(peopleEntity.deviceCode);
                    }
                }
            });
        }
        this.setState({
            autoComplete_deviceCode: data
        });
    };

    //数据过滤器 value：筛选条件  record 人员数据
    peopleDataFilter = (value, record) => {
        let filters = value.split('&&');
        if (filters.length != 2) {
            console.error('人员筛选条件长度错误');
            return true; //忽略过滤器
        }
        //筛选数据
        return record != null &&
            (_.isEmpty(filters[0]) || (_.isNull(record.deviceCode) == false && record.deviceCode.includes(filters[0]))) &&
            (_.isEmpty(filters[1]) || (_.isNull(record.personCode) == false && record.personCode.includes(filters[1])))
    }

    //查询人员（筛选）
    onFilterPeople = () => {
        //保证参数不能为null、undefined
        let deviceCode = _.isEmpty(this.state.filter_deviceCode) ? '' : this.state.filter_deviceCode.trim();
        let personCode = _.isEmpty(this.state.filter_personCode) ? '' : this.state.filter_personCode.trim();
        let filterStr = `${deviceCode}&&${personCode}`;
        this.setState({
            //TODO zxg:此处注意，尽量使用一个参数，antd 的性能优化有些问题。项目完成后可以提交 issue
            //将多个筛选条件拼接为一个条件，利于后续在一次循环中集中判断，减少[peopleDataFilter]循环判断次数
            dataFilter: [
                filterStr
            ]
        });
    };

    //添加人员
    showAddPeopleModal = () => {
        this.props.showPeopleFormModal('create', {deviceStatus: 1});
    };

    //查看人员信息
    onViewPeopleInfo = (record) => {
        this.props.showPeopleFormModal('modify', record);
    };

    saveFormRef = (form) => {
        this.form = form;
    };

    onSelectChange = (keys) => {
        this.setState({curSelectedRowKeys: keys});
    };


    /**
     * 切换人员类型设置
     * @param type    人员类型表单类型 [none：空；category：人员类型表单；level：人员级别表单]
     */
    changePostFormType = (type) => {
        this.setState({
            postFormType: type
        })
    };

    /**
     * 关闭人员类型设置面板
     */
    closePostSettingModal = () => {
        this.setState({
            postVisible: false,
            postFormType: 'none'
        });
    };

    /**
     * 显示人员类型设置面板
     */
    showPostSettingModal = () => {
        this.setState({
            postVisible: true,
        });
    };

    delPeople = (personCode) => {
        this.props.deletePeople(personCode);
    };

    //数据总数
    footer = () => {
        let peopleDataSource = this.props.peopleDataSource;
        const dataCount = peopleDataSource != null ? peopleDataSource.length : 0;
        return `共计 ${dataCount} 条数据`;
    };

    render() {
        const {peopleDataSource, tableDataLoading, peopleCategory} = this.props;
        const {curSelectedRowKeys} = this.state;
        const rowSelection = {
            curSelectedRowKeys,
            onChange: this.onSelectChange,
        };

        const columns = [{
            title: '照片',
            dataIndex: 'avatarImgPath',
            key: 'avatarImgPath',
            width: 70,
            render: (text, record, index) => {
                //头像显示
                const showImg = (record.avatarImgPath) ? (`${serviceUrl}${record.avatarImgPath}`)
                    : ((record.sex === 0) ? '../../../img/avatar/man.png' : '../../../img/avatar/woman.png');

                //头像预览
                const avatarPopoverContent = (record.avatarImgPath) ? (
                        <img style={{width: '150px', height: '150px'}} src={`${serviceUrl}${record.avatarImgPath}`}/>)
                    : ((record.sex === 0) ? (<img style={{width: '150px', height: '150px'}} src="../../../img/avatar/man.png"/>) : (
                        <img style={{width: '150px', height: '150px'}} src="../../../img/avatar/woman.png"/>));

                return (
                    <Popover content={avatarPopoverContent} placement="right" overlayClassName={styles.avatarPopover}>
                        <Avatar size="large" className={styles.avatar} shape="square"
                                src={showImg}/>
                    </Popover>
                );
            }
        }, {
            title: '安保编号',
            dataIndex: 'personCode',
            key: 'personCode',
            filteredValue: this.state.dataFilter,   //设置过滤条件
            onFilter: (value, record) => this.peopleDataFilter(value, record)   //对每条数据都通过指定函数进行过滤
        }, {
            title: '安保姓名',
            dataIndex: 'personName',
            key: 'personName',
        }, {
            title: '设备编号',
            dataIndex: 'deviceCode',
            key: 'deviceCode',
        }, {
            title: '性别',
            dataIndex: 'sex',
            key: 'sex',
            render: (value) => {
                return value == 0 ? '男' : '女';
            }
        }, {
            title: '年龄',
            dataIndex: 'age',
            key: 'age',
        }, {
            title: '人员类别',
            dataIndex: 'postType',
            key: 'postType',
            render: (postType, postLevel) => {
                let name = null;
                const {peopleCategory} = this.props;
                if (_.isArray(peopleCategory)) {
                    if (peopleCategory.length) {
                        peopleCategory.forEach((item) => {
                            if (postType == item.id) {
                                name = item.name;
                            }
                        });
                    }
                }
                return <span>{name}</span>
            }
        }, {
            title: '人员级别',
            dataIndex: 'postLevel',
            key: 'postLevel',
            render: (postType, postLevel) => {
                let name = null;
                const {peopleCategory} = this.props;
                if (_.isArray(peopleCategory)) {
                    if (peopleCategory.length) {
                        peopleCategory.forEach((item) => {
                            item.childrenList.forEach((itemChild) => {
                                if (postLevel.postLevel == itemChild.id) {
                                    name = itemChild.name;
                                }
                            })
                        });
                    }
                }
                return <span>{name}</span>
            }
        }, {
            title: '联系方式',
            dataIndex: 'contact',
            key: 'contact',
        }, {
            title: '添加日期',
            dataIndex: 'createTime',
            key: 'createTime',
            render: (text) => {
                if (_.isNumber(text)) {
                    return new Date(text).format("yyyy-M-d hh:mm");
                } else {
                    return text;
                }
            },
        }, {
            title: '重点区域',
            dataIndex: 'keyArea',
            key: 'keyArea',
            render: (value) => {
                if (value == 1) {
                    return (<span><Icon type="check-circle" className={styles.greenCircle}/>允许进入</span>);
                } else {
                    return (<span><Icon type="minus-circle" className={styles.redCircle}/>禁止进入</span>);
                }
            }
        }, {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
        }, {
            title: '操作',
            key: 'operation',
            width: 200,
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="primary" className={styles.tableBtn} ghost
                                onClick={() => this.onViewPeopleInfo(record)}
                        >查看</Button>
                        <Popconfirm title="确认要删除此人员吗？" onConfirm={() => this.delPeople([record.personCode])}>
                            <Button type="primary" className={styles.tableBtn} ghost>删除</Button>
                        </Popconfirm>
                    </div>
                );
            },
        }];

        return (
            <Layout className={styles.layout}>
                <Content className={styles.content}>
                    <Row type="flex" align="middle">
                        <Col span={5} className={styles.item}>
                            <span>设备编号</span>
                            <AutoComplete
                                style={{width: '70%'}}
                                dataSource={this.state.autoComplete_deviceCode}
                                onSearch={this.onDeviceCodeAutoCompleteSearch}
                                onChange={(value) => this.setState({filter_deviceCode: value})}
                                value={this.state.filter_deviceCode}
                                allowClear={true}
                                placeholder="设备编号"
                                size="large"
                            >
                                <Input maxLength="30"/>
                            </AutoComplete>
                        </Col>
                        <Col span={5} className={styles.item}>
                            <span>安保编号</span>
                            <AutoComplete
                                style={{width: '70%'}}
                                dataSource={this.state.autoComplete_personCode}
                                onSearch={this.onPersonCodeAutoCompleteSearch}
                                onChange={(value) => this.setState({filter_personCode: value})}
                                value={this.state.filter_personCode}
                                allowClear={true}
                                placeholder="安保编号"
                                size="large"
                            >
                                <Input maxLength="30"/>
                            </AutoComplete>
                        </Col>
                        <Col span={4}>
                            <Button type="primary" icon="search" size="large" className={styles.searchBtn}
                                    onClick={this.onFilterPeople}>查询</Button>
                            <Button icon="sync" size="large" className={styles.searchBtn} onClick={this.onResetSearch}>重置</Button>
                        </Col>
                        <Col span={10} className={styles.textRight}>
                            <Button type="primary" icon="bars" size="large" className={styles.addBtn}
                                    onClick={this.showPostSettingModal}>类别设置</Button>
                            <Popconfirm title="确认要批量删除所选人员吗？"
                                        onConfirm={() => this.delPeople(this.state.curSelectedRowKeys)}>
                                <Button type="primary" icon="delete" size="large"
                                        className={styles.addBtn}>批量删除</Button>
                            </Popconfirm>
                            <Button type="primary" icon="user-add" size="large" onClick={this.showAddPeopleModal}
                                    className={styles.addBtn}>添加人员</Button>
                        </Col>
                    </Row>
                    <Row className={styles.tableRow}>
                        <Col span={24}>
                            <Table rowSelection={rowSelection}
                                   rowKey={record => record.personCode}
                                   className={styles.table} bordered={true}
                                   footer={this.footer}
                                   size="middle"
                                   loading={tableDataLoading}
                                   columns={columns} dataSource={peopleDataSource}>
                            </Table>
                        </Col>
                    </Row>
                    <PeopleFormModal/>
                    {/*人员类型设置面板*/}
                    <CategoryFormModel
                        postVisible={this.state.postVisible}
                        postFormType={this.state.postFormType}
                        changePostFormType={this.changePostFormType}
                        closePostSettingModal={this.closePostSettingModal}
                    />
                </Content>
            </Layout>
        );
    }
}

export function actionsDispatchToProps(dispatch) {
    return {
        queryAllPeople: () => dispatch(queryAllPeopleBegin()),
        showErrorMessage: (message) => dispatch(showErrorMessage(message)),
        showPeopleFormModal: (operation, personCode) => dispatch(peopleFormModalShow(operation, personCode)),
        onChangeUsername: (evt) => dispatch(changeUsername(evt.target.value)),
        onSubmitForm: (evt) => {
            if (evt !== undefined && evt.preventDefault) evt.preventDefault();
            dispatch(loadRepos());
        },
        deletePeople: (personCodes) => dispatch(deletePeople(personCodes))
    }
        ;
}

const selectorStateToProps = createStructuredSelector({
    peopleDataSource: peopleDataSourceSelector(),
    tableDataLoading: tableDataLoadingSelector(),
    peopleCategory: peopleCategorySourceSelector(),
});

export default connect(selectorStateToProps, actionsDispatchToProps)(PeopleMgrPage);