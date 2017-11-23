/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  zxg (zhangxiaoguang@fengmap.com)
 * @date     2017/8/6
 * @describe 实时监控页面，系统默认页面。路径为'/'
 */

'use strict';
import React from 'react';
import {Layout, Menu, Icon} from 'antd';
import {Button} from 'antd';

const {SubMenu} = Menu;
const {Sider, Content, Header, Footer} = Layout;
import {Input} from 'antd';
import {Avatar} from 'antd';
import {Radio} from 'antd';
import {Card} from 'antd';
import {Badge} from 'antd';
import {notification} from 'antd';
import {Modal} from 'antd';

const RadioButton = Radio.Button;
const Search = Input.Search;
import styles from './index.less';

import {createStructuredSelector} from 'reselect';
import {connect} from 'react-redux';
import {makeSelectRepos, makeSelectLoading, makeSelectError} from '../App/selectors';
import {loadRepos} from '../App/actions';
import {changeUsername} from './actions';
import {makeSelectUsername} from './selectors';


import {Pagination} from 'antd';
import {Form} from 'antd';
import {Table} from 'antd';
import {realTimeLocationsSelector, SelectorOnLineDevice} from "../MainContainer/selectors";

//action people
import {queryAllPeopleBegin} from '../PeopleMgrPage/actions';

//selectors people
import {peopleDataSourceSelector, peopleListSelector} from '../PeopleMgrPage/selectors';

//action area
import {queryAreaListBegin} from '../AreaSettingPage/actions';

//selectors area
import {SelectkeyArea} from '../AreaSettingPage/selectors';

//action category
import {getPeopleCategory} from '../CategoryFormModel/actions';

//selectors category
import {peopleCategorySourceSelector} from '../CategoryFormModel/selectors';

//action main
import {putMessageIsRead, putMessageIsShow,} from '../MainContainer/actions';

//selectors main
import {alertMessageDataSelector, offLineSelector} from '../MainContainer/selectors';

//自定义组件
import PeopleCard from '../../components/peopleCard';
import MonitoringMap from '../../components/MonitoringMap';

//工具类
import _ from 'lodash';
import {getFMCenter} from '../../utils/tools';

const CollectionCreateForm = Form.create()(
    (props) => {
        const {visible, onCancel, onCreate, confirmLoading, alertMessageData, putMessageIsRead, positionArea} = props;

        //报警信息
        const columns = [{
            title: '序号',
            dataIndex: 'key',
            key: 'key',
            render: function (text, record, index) {
                return <span className={record.isRead === 0 ? styles.bold : styles.normal}>{index + 1}</span>
            }
        }, {
            title: '报警时间',
            dataIndex: 'dateTime',
            key: 'dateTime',
            render: function (text, record, index) {
                return <span className={record.isRead === 0 ? styles.bold : styles.normal}>{record.dateTime}</span>
            }
        }, {
            title: '涉警人员',
            dataIndex: 'personName',
            key: 'personName',
            render: function (text, record, index) {
                return <span className={record.isRead === 0 ? styles.bold : styles.normal}>{record.personName}</span>
            }
        }, {
            title: '人员编号',
            dataIndex: 'personCode',
            key: 'personCode',
            render: function (text, record, index) {
                return <span className={record.isRead === 0 ? styles.bold : styles.normal}>{record.personCode}</span>
            }
        }, {
            title: '类别',
            dataIndex: 'level',
            key: 'level',
            render: function (text, record, index) {
                return <span className={record.isRead === 0 ? styles.bold : styles.normal}>{record.level}</span>
            }
        }, {
            title: '设备编号',
            dataIndex: 'deviceCode',
            key: 'deviceCode',
            render: function (text, record, index) {
                return <span className={record.isRead === 0 ? styles.bold : styles.normal}>{record.deviceCode}</span>
            }
        }, {
            title: '报警内容',
            dataIndex: 'remark',
            key: 'remark',
            render: function (text, record, index) {
                return <span
                    className={record.isRead === 0 ? styles.bold : styles.normal}>{record.personName}{record.remark}</span>
            }
        }, {
            title: '操作',
            key: 'operation',
            width: 110,
            render: (text, record) => {
                return (
                    <Button type="primary" onClick={() => {
                        positionArea(record.id);
                    }} className={styles.tableBtn} ghost>定位区域</Button>
                );
            },
        }];

        const footer = () => `共计 ${alertMessageData.size} 条数据`;

        const pagination = {
            defaultCurrent: 1,
            total: alertMessageData.size,
            /*showTotal: () => {
                (total, range) => `${range[0]}-${range[1]} of ${total} items`
            },*/
            pageSize: 10
        };

        return (
            <Modal
                title={<span><Icon type="hdd"/>今日报警</span>}
                visible={visible}
                onOk={onCreate}
                onCancel={onCancel}
                confirmLoading={confirmLoading}
                footer={null}
                width={1040}
                className={styles.redModal}
            >
                <Table className={styles.table}
                       bordered={true}
                       footer={footer}
                       size="middle"
                       pagination={pagination}
                       columns={columns}
                       dataSource={alertMessageData.toArray()}
                       onRowClick={(record, index, event) => {
                           putMessageIsRead(record.key);
                       }}>
                </Table>
            </Modal>
        );
    }
);

export class MonitoringPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            containerStyle: {
                height: '100%',
                width: '100%',
                minHeight: '100%',
                top: '0px',
                left: '0px',
                backgroundColor: '#f2f4f5'
            },
            siderCollapsed: false,         //人员信息sider当前收起状态, 【false】展开 【true】收起
            siderTrigger: null,
            peopleInfoWinClassName: styles.peopleCard,
            peopleCardHidden: false,
            alarmModalVisible: false,           //报警弹窗
            alarmLoading: false,                //报警loading
            alarmConfirmLoading: false,
            ModalText: 'Content of the modal',
            //allPeopleLocationMap: new Map(),            //所有人员的位置信息 key:personCode value:LocationEntity={...FMImageMarker}
            people: null,                            //人员详细信息
            positionPersonCode: '',                 //定位的personCode
            layerVisible: false,                    //显示/隐藏视频marker
            peopleList: props.peopleList,
            carVisibility: 'hidden',
            itemKey: '',
        };

        //定义全局map变量
        this.fmMap = null;
        this.fmapID = 'md-xm-57-9';
        this.imageMarker = null;
        this.peopleCategory = [];           //人员类型数组
        this.onLineDevice = null;
        this.lastClickId = null;            //记录最后点击的人员编号id
        this.notificationKeys = [];         //弹出信息框key集合
        this.personImageMarkers = {};        //地图人员marker对象
    }

    /**
     * 组件第一次加载完成周期，创建地图
     */
    componentDidMount() {
        //查询所有人员
        this.props.queryAllPeopleBegin();
        //查询人员类型
        this.props.getPeopleCategory();
    }

    componentDidUpdate = () => {
        this.showNotification();
        this.updateAreaName();
    };

    /**
     * 实时更新人员详细信息位置信息
     */
    updateAreaName = () => {
        let people = this.state.people;
        if (!this.state.peopleCardHidden && people) {
            const realTimeLocations = this.props.realTimeLocations;
            if (realTimeLocations.personCode === people.personCode) {
                people.areaName = realTimeLocations.areaName ? realTimeLocations.areaName : '无法获取';
            }
        }
    };

    componentWillReceiveProps(nextProps) {
        if (_.eq(this.peopleList, nextProps.peopleList) == false) {
            this.setState({
                peopleList: nextProps.peopleList
            });
        }

        if (_.eq(this.onLineDevice, nextProps.onLineDevice) == false) {
            this.onLineDevice = nextProps.onLineDevice;

            this.setState({
                peopleList: nextProps.peopleList
            });
        }
    };

    /**
     * 点击列表人员显示人员详细信息
     * @param item
     * @param key
     * @param selectedKeys
     */
    onPeopleItemSelected = (e) => {
        const {item, key, selectedKeys} = e;
        const peopleDataSource = this.props.peopleDataSource ? this.props.peopleDataSource : [];
        let people = peopleDataSource.filter((item) => {
            return item.personCode === key;
        });

        if (people.length > 0) {
            people = people[0];
            people.areaName = '无法获取';

            this.props.alertMessageData.map((item) => {
                if (item.personCode === people.personCode && item.isArea) {
                    people.areaName = item.areaName ? item.areaName : '无法获取';
                }
            });
        }

        //显示选项卡
        if (this.state.carVisibility === 'hidden') {
            this.setState({
                carVisibility: 'visible',
            })
        }

        this.setState({
            people: people,
            itemKey: key,
        });

        if (this.lastClickId !== key) {
            this.setState({
                peopleInfoWinClassName: "animated fadeInUp " + styles.peopleCard,
                peopleCardHidden: false
            });
        } else {
            this.onClosePeopleInfoWindow();
        }

        this.lastClickId = key;
    };

    /**
     * 当人员面板展开-收起时的回调函数，有点击 trigger 以及响应式反馈两种方式可以触发
     * @param collapsed 当前状态（【true】收起 【false】展开）
     * @param type 触发类型
     */
    onCollapse = (collapsed, type) => {
        this.setState({siderCollapsed: !this.state.siderCollapsed});
        if (this.state.siderCollapsed) {  //收起状态
            //展开
            this.setState({
                siderTrigger: null
            });
            //修改指南针位置
            this.fmMap.options.compassOffset = [278, 20];
            this.fmMap.updateSize();
        } else {
            //收缩
            this.setState({
                siderTrigger: undefined
            });
            //修改指南针位置
            this.fmMap.options.compassOffset = [28, 20];
            this.fmMap.updateSize();
        }
    };

    /**
     * 显示/隐藏 人员信息窗口
     */
    onClosePeopleInfoWindow = () => {
        if (this.state.peopleCardHidden) {
            //显示人员信息窗口
            this.setState({
                peopleInfoWinClassName: "animated fadeInUp " + styles.peopleCard,
                peopleCardHidden: false
            });
        } else {
            //隐藏窗口
            this.setState({
                peopleInfoWinClassName: "animated fadeOutDown " + styles.peopleCard,
                peopleCardHidden: true,
            });
            this.lastClickId = null;
        }
    };

    /**
     * 显示报警列表
     */
    onShowAlarmModal = () => {
        this.setState({
            alarmModalVisible: true
        });
    };

    handleCreate = () => {
        this.setState({
            ModalText: 'The modal will be closed after two seconds',
            alarmConfirmLoading: true,

        });
    };

    handleCancel = () => {
        this.setState({
            alarmModalVisible: false,
        });
    };

    /**
     * 根据人员类别id获取人员类别名称
     * @param id 人员类别id
     */
    getPostTypeName(id) {
        if (!id) return;
        if (!this.peopleCategory.length) {
            this.props.peopleCategory.map((type) => {
                this.peopleCategory.push({id: type.id, name: type.name});
                type.childrenList.map((level) => {
                    this.peopleCategory.push({id: level.id, name: level.name});
                })
            })
        }

        const item = this.peopleCategory.filter((item) => {
            return item.id == id;
        });

        if (!item) return;
        return item[0].name;
    }

    /**
     * 获取人员头像地址 如果没有上传图像，则判断性别设置默认头像地址
     * @param imgUrl 人员头像地址
     * @param sex 人员性别 [0,男][1,女]
     */
    getImageUrl = (imgUrl, sex) => {
        const service = window.serviceUrl;
        if (imgUrl) {
            return service + imgUrl;
        } else {
            if (sex === 0) {
                return '../../img/avatar/man.png';
            } else {
                return '../../img/avatar/woman.png';
            }
        }
    };

    /**
     * 人员显示/隐藏
     * @param e
     */
    visiblePeopleBtn = (e, personCode) => {
        e.stopPropagation();
        const obj = this.personImageMarkers[personCode];
        if (obj) {
            if (!obj.imageMarker) return;
            let imageMarker = obj.imageMarker;
            imageMarker.visible = !imageMarker.visible;
        }
    };

    /**
     * 显示/隐藏地图上所有的imageMarker
     * @param visible 显示(true)/隐藏(false)参数
     */
    isVisibleAllPeopleMarker = (visible) => {
        const personMarkers = this.personImageMarkers;
        if (!personMarkers) return;
        if (personMarkers) {
            for (let key in personMarkers) {
                const personMarker = personMarkers[key];
                if (!personMarker) continue;
                let imageMarker = personMarker.imageMarker;
                imageMarker.visible = visible;
            }
        }
    };

    /**
     * 人员定位
     * @param e
     */
    peopleLocationBtn = (e, personCode) => {
        e.stopPropagation();

        /**
         * 当前定位人员code不为空，并且上一次的personCode和当前点击的personCode一致的时候则清空，否则更新定位personCode
         */
        if (this.state.positionPersonCode && this.state.positionPersonCode === personCode) {
            this.setState({
                positionPersonCode: ''
            });
        } else {
            //定位到视野中心
            if (this.personImageMarkers) {
                const personImageMarker = this.personImageMarkers[personCode];
                if (personImageMarker) {
                    //地图放大动画
                    const fmMap = this.fmMap;
                    fmMap.mapScaleLevel = {
                        level: 24,
                        duration: 1,
                        callback: () => {
                            const imageMarker = personImageMarker.imageMarker;
                            const coords = {x: imageMarker.x, y: imageMarker.y, groupID: 1};
                            fmMap.moveToCenter(coords);
                        }
                    };
                }
            }
            this.setState({
                positionPersonCode: personCode
            });
        }
    };

    /**
     * 获取当前personCode的imageMarker是否显示(true)/隐藏(false)状态
     * @param perosonCode
     * @returns {boolean}
     */
    getVisiblePersonMarker = (perosonCode) => {
        const personImageMarkers = this.personImageMarkers;
        let visibleImageMarker = false;
        if (personImageMarkers) {
            const personImageMarker = personImageMarkers[perosonCode];
            if (personImageMarker) {
                visibleImageMarker = personImageMarker.imageMarker.visible;
            }
        }
        return visibleImageMarker;
    };

    /**
     * 获取左侧菜单
     */
    getMenu = () => {
        const peopleList = this.state.peopleList;
        this.onLineCount = 0;   //在线人数

        //检查在线人数
        peopleList.map((people) => {
            const personCode = people.personCode;
            const imageMarker = this.personImageMarkers[personCode];
            people.onLine = false;
            if (!this.onLineDevice) return;
            this.onLineDevice.map((device) => {
                if (device.deviceCode === people.deviceCode) {
                    people.onLine = true;
                    this.onLineCount++;
                }
            });

            if (!people.onLine && imageMarker) {
                imageMarker.imageMarker.dispose();
                delete this.personImageMarkers[personCode];
                this.setState({
                    delPersonCode: personCode
                })
            }
        });


        //根据在线排序
        peopleList.sort((a, b) => {
            const x = a.onLine ? 1 : 0;
            const y = b.onLine ? 1 : 0;

            if (x < y) {
                return 1;
            }
            if (x > y) {
                return -1;
            }
            if (x === y) {
                return 0;
            }
        });

        return peopleList.map((people) => {
            const personCode = people.personCode;
            const color = this.state.positionPersonCode === personCode ? '#FFC600' : '#f2f2f2';
            const visible = this.getVisiblePersonMarker(personCode);
            return (
                <Menu.Item key={personCode} disabled={!people.onLine}>
                    <Avatar size="large"
                            src={this.getImageUrl(people.avatarImgPath, people.sex)}/>
                    <div className={styles.content}>
                        <div className={styles.code}>{people.personCode}</div>
                        <div>
                            <span
                                className={people.onLine ? styles.floor : styles.floorOffline}>
                                {people.onLine ? '1F' : '离线'}
                            </span>{people.personName}
                        </div>
                    </div>
                    {
                        //#FFC600  #f2f2f2
                        people.onLine
                            ?
                            <div className={styles.btnContent}>
                                <Button onClick={(e) => {
                                    e.stopPropagation();
                                    this.visiblePeopleBtn(e, personCode);
                                }}
                                        type="primary"
                                        icon={visible ? 'eye-o' : 'eye'}
                                        title="隐藏/可见"/>
                                <Button style={{color: color}} onClick={(e) => {
                                    e.stopPropagation();
                                    this.peopleLocationBtn(e, personCode);
                                    this.onPeopleItemSelected({key: personCode});
                                }}
                                        type="primary"
                                        icon="environment"
                                        title="定位"/>
                            </div>
                            :
                            null
                    }
                </Menu.Item>
            )
        })
    };

    /**
     * 地图加载完成回调函数
     */
    loadComplete = (map) => {
        this.fmMap = map;
        this.props.queryAreaListBegin();
        //点击地图事件
        map.on('mapClickNode', (event) => {
            //点击imageMarker
            if (event.alias === 'imageMarker') {
                const key = event.name_;
                if (key) {
                    this.onPeopleItemSelected({key});
                }
            }
        });
    };

    /**
     * 记录personImageMarker
     * @param personCode 当前imgerMarker的人员编号，作为主键
     * @param imageMarker 当前imageMarker对象
     */
    personImageMarker = (personCode, imageMarker) => {
        this.personImageMarkers[personCode] = {imageMarker: imageMarker};
    };

    /**
     * 获取未读信息条数
     */
    getUnReadCount = () => {
        let count = 0;
        this.props.alertMessageData.forEach((item) => {
            if (item.isRead === 0) {
                count++;
            }
        });
        return count;
    };

    /**
     * 显示通知提醒框
     */
    showNotification = () => {
        this.props.alertMessageData.forEach((item) => {
            if (item.isShow && this.notificationKeys.length <= 3) {
                const index = this.notificationKeys.indexOf(item.key);
                //用户进入重点区域，并且没有信息通知框，则显示信息通知框，并且记录当前提示通知框的key
                if (item.isArea === true && index === -1) {
                    const key = item.key;
                    this.notificationKeys.push(key);
                    notification['error']({
                        key: key,
                        message: `警告：【${item.personName}】${item.remark}`,
                        duration: 3,
                        onClose: () => {
                            //如果当前所在重点区域的消息框关闭，此次重点区域中移动不再弹出信息框，直到下次再次进入重点区域再弹出信息框；
                            this.notificationKeys.splice(index, 1);
                        },
                        icon: <Icon type="close-circle" style={{color: '#ff0000', fontSize: 18}}/>,
                        style: {
                            width: 'auto',
                            height: 38,
                            padding: 7,
                        }
                    });
                }

                this.props.putMessageIsShow({
                    id: item.id,
                    isShow: false,
                })
            }

            const personCode = item.personCode;
            //获取当前imageMarker对象
            let personMarker = this.personImageMarkers[personCode];

            if (personMarker) {
                let imageMarker = null;
                imageMarker = personMarker.imageMarker;
                //判断当前是否在重点区域
                if (item.isArea) {
                    if (!personMarker.status) {
                        //是否已经是红色的图标；
                        //status=true，已经是红色的图标；
                        //status=false，已经是蓝色的图标；
                        imageMarker.url = './img/peopleMarker_red.png';
                        personMarker['status'] = true;
                    }
                } else {
                    //是否已经是蓝色的图标
                    if (personMarker.status) {
                        imageMarker.url = './img/peopleMarker.png';
                        personMarker['status'] = false;
                    }
                }
            }
        });
    };

    /**
     * 显示/隐藏视频marker标注
     */
    changeVideoVisible = () => {
        this.setState({
            layerVisible: !this.state.layerVisible,
        })
    };

    /**
     * 人员信息搜索（模糊搜索，根据人员名称或人员编号）
     * @parm e 事件对象
     */
    onSearchKeyword = (e) => {
        e.persist();
        this.timeStamp = e.timeStamp;

        setTimeout(() => {
            if (this.timeStamp === e.timeStamp) {
                const peopleList = this.getPeopleListBykeyword(e.target.value);

                this.setState({
                    peopleList: peopleList,
                })
            }
        }, 500);
    };

    /**
     * 根据关键字搜索人员列表信息(人员名称或人员编号)
     * @keyword 搜索信息关键字
     */
    getPeopleListBykeyword = (keyword) => {
        const peopleList = this.props.peopleList;
        let list = [];
        if (keyword) {
            list = peopleList.filter((item) => {
                return item.personName.indexOf(keyword) >= 0 || item.personCode.indexOf(keyword) >= 0;
            });
        } else {
            list = peopleList;
        }
        return list;
    };

    /**
     * 将区域设置在地图视野中心点
     * @param areaId 区域id
     */
    positionArea = (areaId) => {
        if (!areaId) return;
        const keyArea = this.props.keyArea;
        if (!keyArea) return;
        const areaArr = keyArea.filter((area) => {
            return area.id === areaId;
        });
        if (areaArr.length > 0) {
            const area = areaArr[0];
            const polygon = area.polygon;
            const polygonArr = JSON.parse(polygon);
            if (polygonArr.length > 0) {
                const coord = getFMCenter(polygonArr);//计算地图区域中心点
                const c = coord[0];
                const fmMap = this.fmMap;
                if (c) {
                    //地图放大动画
                    fmMap.mapScaleLevel = {
                        level: 24,
                        duration: 1,
                        callback: () => {
                            fmMap.moveToCenter({x: c.x, y: c.y, groupID: 1});
                        }
                    };
                }
            }
        }
    };

    /**
     * 显示/隐藏地磁图
     */
    heatMapVisible = () => {
        const map = this.fmMap;
        const hm = fengmap.FMHeatMap.create(map, {});
        if (!this.visibleHeatMap) {
            const tex = fengmap.MapUtil.loadTexture('../../img/heatmap2.png');
            hm.setTexture(1, tex);
            this.visibleHeatMap = true;
        } else {
            hm.disposeHeatMap(1);
            this.visibleHeatMap = false;
        }
    };

    render() {
        const {userName} = this.state;
        const suffix = userName ? <Icon type="close-circle" onClick={this.emitEmpty}/> : null;
        const peopleDataCount = this.state.peopleList.length;

        //人员菜单
        const menu = this.getMenu();
        //报警信息
        const alertMessageData = this.props.alertMessageData;
        //未读信息条数
        const unReadCount = this.getUnReadCount();

        return (
            <Layout className={styles.layout}>
                <Sider width={256}
                       className={styles.sider}
                       collapsible={true}
                       collapsed={this.state.siderCollapsed}
                       onCollapse={this.onCollapse}
                       trigger={this.state.siderTrigger}
                       collapsedWidth={0}>
                    <Layout style={{height: '100%'}}>
                        <div style={{
                            height: '38px',
                            background: '#302036',
                            lineHeight: '38px',
                            color: '#fff',
                            padding: '0 10px'
                        }}>
                            人员信息&nbsp;&nbsp;&nbsp;{this.onLineCount} / {peopleDataCount}
                            <span className={styles.left_arrow} title="收起窗口" onClick={this.onCollapse.bind(this)}><Icon
                                type="left"/></span>
                        </div>
                        <Content>
                            <div style={{padding: '10px 13px'}}>
                                <Input
                                    placeholder="输入编号或姓名筛选"
                                    prefix={<Icon type="search"/>}
                                    suffix={suffix}
                                    onInput={this.onSearchKeyword}
                                    className={styles.searchInput}
                                    ref={node => this.userNameInput = node}
                                />
                            </div>
                            <Menu
                                mode="inline"
                                className={styles.menu}
                                selectedKeys={[this.state.itemKey]}
                                onClick={this.onPeopleItemSelected}>
                                {menu}
                            </Menu>
                        </Content>
                        <Footer className={styles.footer}>
                            <Button ghost size="small" icon="eye" onClick={() => {
                                this.isVisibleAllPeopleMarker(true);
                            }}>全部可见</Button>
                            <Button ghost size="small" icon="eye-o" onClick={() => {
                                this.isVisibleAllPeopleMarker(false);
                            }}>全部隐藏</Button>
                        </Footer>
                    </Layout>
                </Sider>
                <Content>
                    {/*人员定位*/}
                    <MonitoringMap
                        realTimeLocations={this.props.realTimeLocations}
                        loadComplete={this.loadComplete}
                        personImageMarker={this.personImageMarker}
                        positionPersonCode={this.state.positionPersonCode}
                        layerVisible={this.state.layerVisible}
                        personImageMarkers={this.personImageMarkers}
                        keyArea={this.props.keyArea}/>
                    {/*人员详细信息*/}
                    <PeopleCard
                        peopleInfoWinClassName={this.state.peopleInfoWinClassName}
                        onClosePeopleInfoWindow={this.onClosePeopleInfoWindow}
                        people={this.state.people}
                        carVisibility={this.state.carVisibility}
                        getPostTypeName={this.getPostTypeName.bind(this)}
                    />
                    {/*地图操作按钮*/}
                    <div className={styles.mapActions}>
                        <span className={styles.mapActionBtn} onClick={this.onShowAlarmModal} title="今日报警">
                            <Badge count={unReadCount}>
                                <img src="./img/fm_controls/alarm.png"></img>
                            </Badge>
                        </span>
                        <span className={styles.mapActionBtn} onClick={this.changeVideoVisible}>
                            <img src="./img/fm_controls/video.png"></img>
                        </span>
                        <span className={styles.mapActionBtn} title="地磁图" onClick={this.heatMapVisible}>
                            <img src="./img/fm_controls/hotmap.png"></img>
                        </span>
                    </div>
                    {/*报警信息窗口*/}
                    <CollectionCreateForm
                        ref={this.saveFormRef}
                        visible={this.state.alarmModalVisible}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                        loading={this.state.alarmLoading}
                        confirmLoading={this.state.alarmConfirmLoading}
                        alertMessageData={alertMessageData}
                        putMessageIsRead={this.props.putMessageIsRead}
                        positionArea={this.positionArea}
                    />
                </Content>
            </Layout>
        );
    }
}

export function actionsDispatchToProps(dispatch) {
    return {
        queryAllPeopleBegin: () => dispatch(queryAllPeopleBegin()),
        getPeopleCategory: () => dispatch(getPeopleCategory()),
        queryAreaListBegin: () => dispatch(queryAreaListBegin()),
        putMessageIsRead: (id) => dispatch(putMessageIsRead(id)),
        putMessageIsShow: (id) => dispatch(putMessageIsShow(id)),

    }
}

const selectorStateToProps = createStructuredSelector({
    realTimeLocations: realTimeLocationsSelector(),
    peopleDataSource: peopleDataSourceSelector(),
    peopleCategory: peopleCategorySourceSelector(),
    keyArea: SelectkeyArea(),
    onLineDevice: SelectorOnLineDevice(),
    alertMessageData: alertMessageDataSelector(),
    peopleList: peopleListSelector(),

});

export default connect(selectorStateToProps, actionsDispatchToProps)(MonitoringPage);