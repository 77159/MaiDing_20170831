/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  zxg (zhangxiaoguang@fengmap.com)
 * @date     2017/8/6
 * @describe 设备管理页面。路径为'/device'
 */

'use strict';
import React from 'react';
import {Layout} from 'antd';

const {Content} = Layout;
import {Button} from 'antd';
import {Input} from 'antd';
import {Select} from 'antd';
import {AutoComplete} from 'antd';

const Option = Select.Option;
import {Row, Col} from 'antd';
import {Table} from 'antd';
import {Popconfirm} from 'antd';
import styles from './index.less';
import {createStructuredSelector} from 'reselect';
import {connect} from 'react-redux';
import {showErrorMessage} from '../App/actions';
import _ from 'lodash';
import {
    queryAllDeviceBegin,
    modifyDevice,
    deleteDevice,
    queryAllNotDeviceBegin
} from './actions';
import {deviceDataSourceSelector, tableDataLoadingSelector, notDeviceDataSourceSelector, deviceEntitySelector} from './selectors';
import DeviceFormModal from '../DeviceFormModal';
import {deviceFormModalShow} from "../DeviceFormModal/actions";

export class DeviceMgrPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            filter_deviceCode: '',             //设备编号-筛选条件，需要初始化，不要设置为null
            filter_personCode: '',             //安保编号-筛选条件，需要初始化，不要设置为null
            filter_workStatus: 'all',          //工作状态-筛选条件 [all] 全部（默认）[0] 离线 [1] 工作
            filter_deviceStatus: 'all',        //设备状态-筛选条件 [all] 全部（默认）[0] 禁用 [1] 启用
            dataFilter: null,                  //数据过滤器数组，只有一条记录，将筛选条件用&&连接。格式：['设备编号'&&'安保编号'&&'工作状态'&&'设备状态']
            curSelectedRowKeys: [],
            autoComplete_deviceCode: [],       //设备编号自动完成提示数组
            autoComplete_personCode: [],       //安保编号自动完成提示数组
        };
    }

    componentDidMount() {
        //加载设备数据
        this.props.queryAllDevice();
        this.props.queryAllNotDevice();
    }

    //数据过滤器 value:筛选条件 record 设备数据 index 数据索引
    deviceDataFilter = (value, record) => {
        let filters = value.split('&&');
        if (filters.length != 4) {
            console.error('设备筛选条件长度错误');
            return true; //忽略过滤器
        }
        //筛选数据
        return record != null &&
            (_.isEmpty(filters[0]) || (_.isNull(record.deviceCode) == false && record.deviceCode.includes(filters[0]))) &&
            (_.isEmpty(filters[1]) || (_.isNull(record.personCode) == false && record.personCode.includes(filters[1]))) &&
            (record.workStatus == filters[2] || filters[2] == 'all') &&
            (record.deviceStatus == filters[3] || filters[3] == 'all')
    }

    //查询设备（筛选）
    onFilterDevice = () => {
        //保证参数不能为null、undefined
        let deviceCode = _.isEmpty(this.state.filter_deviceCode) ? '' : this.state.filter_deviceCode.trim();
        let personCode = _.isEmpty(this.state.filter_personCode) ? '' : this.state.filter_personCode.trim();
        let filterStr = `${deviceCode}&&${personCode}&&${this.state.filter_workStatus}&&${this.state.filter_deviceStatus}`;
        this.setState({
            //将多个筛选条件拼接为一个条件，利于后续在一次循环中集中判断，减少[deviceDataFilter]循环判断次数
            dataFilter: [
                filterStr
            ]
        });
    }

    //重置
    onResetSearch = () => {
        this.setState({
            filter_deviceCode: '',
            filter_personCode: '',
            filter_workStatus: 'all',
            filter_deviceStatus: 'all',
            dataFilter: null,
            autoComplete_deviceCode: [],
            autoComplete_personCode: [],
        });
        //刷新数据
        this.props.queryAllDevice();
    }

    //添加设备
    showCreateDeviceModal = () => {
        //显示添加设备对话框
        this.props.showDeviceFormModal('create', {deviceStatus: 1});
    };

    //查看设备
    onViewDeviceInfo = (record) => {
        //显示添加设备对话框
        this.props.showDeviceFormModal('modify', record);
    };

    //改变设备状态
    onChangeDeviceStatus = (record) => {
        record.deviceStatus = record.deviceStatus ? 0 : 1;
        this.props.modifyDevice(record);
    }

    //删除设备
    onDeleteDevice = (deviceCode) => {
        this.props.deleteDevice(deviceCode);
    }

    onSelectChange = (keys) => {
        this.setState({curSelectedRowKeys: keys});
    }

    //设备编号自动完成填充
    onDeviceCodeAutoCompleteSearch = (value) => {
        let deviceDataSource = this.props.deviceDataSource;
        let data = [];
        //非空，且自动提示最少需要输入3个字符
        if (_.isEmpty(value) == false && value.trim().length > 2) {
            //遍历设备数据集合，将设备编号中包含输入字符的完整编号数据写入自动完成提示数据集合中。
            deviceDataSource.forEach(deviceEntity => {
                if (deviceEntity.deviceCode.includes(value)) {
                    data.push(deviceEntity.deviceCode);
                }
            });
        }
        this.setState({
            autoComplete_deviceCode: data,
        });
    }

    //安保编号自动完成填充
    onPersonCodeAutoCompleteSearch = (value) => {
        let deviceDataSource = this.props.deviceDataSource;
        let data = [];
        //非空，且自动提示最少需要输入3个字符
        if (_.isEmpty(value) == false && value.trim().length > 2) {
            //遍历设备数据集合，将安保编号中包含输入字符的完整编号数据写入自动完成提示数据集合中。
            deviceDataSource.forEach(deviceEntity => {
                if(deviceEntity.personCode) {
                    if (deviceEntity.personCode.includes(value)) {
                        data.push(deviceEntity.personCode);
                    }
                }
            });
        }
        this.setState({
            autoComplete_personCode: data,
        });
    }

    render() {
        const {curSelectedRowKeys} = this.state;
        const selection = {
            selectedRowKeys: curSelectedRowKeys,
            onChange: this.onSelectChange,
        };

        const {deviceDataSource, tableDataLoading} = this.props;
        //数据总数
        const dataCount = deviceDataSource != null ? deviceDataSource.length : 0;

        const columns = [{
            title: '设备编号',
            dataIndex: 'deviceCode',
            key: 'deviceCode',
            filteredValue: this.state.dataFilter,      //设置过滤条件
            onFilter: (value, record) => this.deviceDataFilter(value, record),   //每条数据都通过指定的函数进行过滤
        }, {
            title: '设备名称',
            dataIndex: 'deviceName',
            key: 'deviceName',
        }, {
            title: '工作状态',
            dataIndex: 'workStatus',
            key: 'workStatus',
            render: (text) => {
                if (text === 1) {
                    return (<span>工作<i className={styles.greenCircle}/></span>);
                } else {
                    return (<span>离线<i className={styles.redCircle}/></span>);
                }
            }
        }, {
            title: '剩余电量',
            dataIndex: 'dumpPower',
            key: 'dumpPower',
            render: (text) => {
                if (text == null) {
                    return (<span>未知</span>);
                } else if (text && text < 20) {
                    return (<span className={styles.lowPower}>{text}%</span>);
                } else {
                    return (<span className={styles.power}>{text}%</span>);
                }
            }
        }, {
            title: '设备状态',
            dataIndex: 'deviceStatus',
            key: 'deviceStatus',
            render: (text) => {
                if (text === 1) {
                    return (<span>启用<i className={styles.greenCircle}/></span>);
                } else {
                    return (<span>禁用<i className={styles.redCircle}/></span>);
                }
            }
        }, {
            title: '备注',
            dataIndex: 'remark',
            key: 'remark',
        }, {
            title: '安保编号',
            dataIndex: 'personCode',
            key: 'personCode',
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
            title: '操作',
            key: 'operation',
            width: 280,
            render: (text, record, index) => {
                return (
                    <div>
                        <Button type="primary" className={styles.tableBtn} ghost
                                onClick={() => this.onViewDeviceInfo(record)}>查看</Button>
                        <Popconfirm title="确认要执行此操作吗？" onConfirm={() => this.onChangeDeviceStatus(record)}>
                            <Button type="primary" className={styles.tableBtn}
                                    ghost>{Boolean(record.deviceStatus) ? '禁用' : '启用'}</Button>
                        </Popconfirm>
                        <Popconfirm title="确认要删除此设备吗？" onConfirm={() => this.onDeleteDevice([record.deviceCode])}>
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
                        <Col span={4} className={styles.item}>
                            <span>设备编号</span>
                            <AutoComplete
                                dataSource={this.state.autoComplete_deviceCode}
                                onSearch={this.onDeviceCodeAutoCompleteSearch}
                                allowClear={true}
                                placeholder="设备编号" size="large"
                                onChange={(value) => this.setState({filter_deviceCode: value})}
                                value={this.state.filter_deviceCode}
                            >
                                <Input maxLength="15"/>
                            </AutoComplete>
                        </Col>
                        <Col span={4} className={styles.item}>
                            <span>安保编号</span>
                            <AutoComplete
                                dataSource={this.state.autoComplete_personCode}
                                onSearch={this.onPersonCodeAutoCompleteSearch}
                                allowClear={true}
                                placeholder="安保编号" size="large"
                                onChange={(value) => this.setState({filter_personCode: value})}
                                value={this.state.filter_personCode}
                            >
                                <Input maxLength="15"/>
                            </AutoComplete>
                        </Col>
                        <Col span={4} className={styles.item}>
                            <span>工作状态</span>
                            <Select defaultValue="all" value={this.state.filter_workStatus} size="large"
                                    onChange={(value) => this.setState({filter_workStatus: value})}>
                                <Option value="all">全部</Option>
                                <Option value="1">工作</Option>
                                <Option value="0">离线</Option>
                            </Select>
                        </Col>
                        <Col span={4} className={styles.item}>
                            <span>设备状态</span>
                            <Select defaultValue="all" value={this.state.filter_deviceStatus} size="large"
                                    onChange={(value) => this.setState({filter_deviceStatus: value})}>
                                <Option value="all">全部</Option>
                                <Option value="1">启用</Option>
                                <Option value="0">禁用</Option>
                            </Select>
                        </Col>
                        <Col span={4}>
                            <Button type="primary" icon="search" size="large" className={styles.searchBtn}
                                    onClick={this.onFilterDevice}>查询</Button>
                            <Button icon="sync" size="large" className={styles.searchBtn} onClick={this.onResetSearch}>重置</Button>
                        </Col>
                        <Col span={4} className={styles.textRight}>
                            <Popconfirm title="确认要批量删除所选设备吗？"
                                        onConfirm={() => this.onDeleteDevice(this.state.curSelectedRowKeys)}>
                                <Button type="primary" icon="delete" size="large" className={styles.addBtn}>批量删除</Button>
                            </Popconfirm>
                            <Button type="primary" icon="hdd" size="large" className={styles.addBtn}
                                    onClick={this.showCreateDeviceModal}>添加设备</Button>
                        </Col>
                    </Row>
                    <Row className={styles.tableRow}>
                        <Col span={24}>
                            <Table rowSelection={selection} rowKey={record => record.deviceCode}
                                   className={styles.table} bordered={true} footer={() => '共计 ' + dataCount + ' 条数据'}
                                   size="middle"
                                   loading={tableDataLoading}
                                   columns={columns} dataSource={deviceDataSource}>
                            </Table>
                        </Col>
                    </Row>
                    <DeviceFormModal/>
                </Content>
            </Layout>
        );
    }
};

export function actionsDispatchToProps(dispatch) {
    return {
        queryAllDevice: () => dispatch(queryAllDeviceBegin()),
        queryAllNotDevice: () => dispatch(queryAllNotDeviceBegin()),
        showErrorMessage: (message) => dispatch(showErrorMessage(message)),
        showDeviceFormModal: (operation, deviceCode) => dispatch(deviceFormModalShow(operation, deviceCode)),
        deleteDevice: (deviceCodes) => dispatch(deleteDevice(deviceCodes)),
        modifyDevice: (deviceEntity) => dispatch(modifyDevice(deviceEntity)),
    };
}

const selectorStateToProps = createStructuredSelector({
    deviceDataSource: deviceDataSourceSelector(),
    tableDataLoading: tableDataLoadingSelector(),
    notDeviceDataSource: notDeviceDataSourceSelector(),
    deviceEntity: deviceEntitySelector(),
});

export default connect(selectorStateToProps, actionsDispatchToProps)(DeviceMgrPage);