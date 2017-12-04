/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  zxg (zhangxiaoguang@fengmap.com)
 * @date     2017/8/6
 * @describe 轨迹回放页面。路径为'/trace'
 */
'use strict';
import React from 'react';
import {Layout, Menu, Icon} from 'antd';
import {Button} from 'antd';
import {Checkbox} from 'antd';
import {DatePicker} from 'antd';
import {Slider} from 'antd';

const {Sider, Content, Footer} = Layout;
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

import {showErrorMessage} from "../App/actions";

import {changeTraceReplay, emptyTraceData} from './actions';

import {SelectorTraceDataSource} from './selectors';

//action people
import {queryAllPeopleBegin} from '../PeopleMgrPage/actions';

//selectors people
import {peopleDataSourceSelector, peopleListSelector} from '../PeopleMgrPage/selectors';

//action category
import {getPeopleCategory} from '../CategoryFormModel/actions';

//action area
import {queryAreaListBegin} from '../AreaSettingPage/actions';

//selectors area
import {SelectkeyArea} from '../AreaSettingPage/selectors';

//selectors category
import {peopleCategorySourceSelector} from '../CategoryFormModel/selectors';

//selectors main
import {realTimeLocationsSelector, SelectorOnLineDevice} from "../MainContainer/selectors";

//工具类
import _ from 'lodash';
import moment from 'moment';
import {Table} from 'antd';
import {Pagination} from 'antd';

//自定义组件
import TraceReplayMap from '../../components/TraceReplayMap';
import PlayerPanel from '../../components/PlayerPanel';

export class TraceReplayPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            userName: '',
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
            alarmModalVisible: false,
            alarmLoading: false,
            alarmConfirmLoading: false,
            ModalText: 'Content of the modal',
            startValue: null,
            endValue: null,
            totalTime: null,
            endOpen: false,
            visibleReplay: false,
            palySliderValue: 3,
            isPalying: false,
            selectedPersonCode: [],         //选择轨迹回放的人员
            personList: null,               //当前人员列表
            selectPersonList: null,
            visiblePersonImage: {},
            moveToCenterPersonCode: '',
            peopleList: this.props.peopleList,
            sPeopleList: null,
        };

        //定义全局map变量
        this.fmMap = null;
        //this.fmapID = 'md-xm-57-9';
        this.fmapID = window.fmapID;
        this.personMarkers = {};
        this.layer = null;
        //this.addMarker = true;
        this.polygonEditor = null;
        //this.imageMarker = null;

        this.peopleCategory = [];           //人员类型数组
        this.onLineDevice = null;           //当前在线设备
        this.lastClickId = null;            //记录最后点击的人员编号id
    }

    /**
     * 初始化完成事件
     */
    componentDidMount() {
        //初始化人员
        this.props.queryAllPeopleBegin();
        //初始化人员类型
        this.props.getPeopleCategory();
    }

    /**
     * 更新props事件
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        if (_.eq(this.onLineDevice, nextProps.onLineDevice) == false) {
            this.onLineDevice = nextProps.onLineDevice;

            this.setState({
                peopleList: nextProps.peopleList
            });
        }
    };

    /**
     * 清空输入框
     */
    emitEmpty = () => {
        this.userNameInput.focus();
        this.userNameInput.refs.input.value = ''
    };

    /**
     * 当人员面板展开-收起时的回调函数，有点击 trigger 以及响应式反馈两种方式可以触发
     * @param collapsed 当前状态（【true】收起 【false】展开）
     * @param type 触发类型
     */
    onCollapse = (collapsed, type) => {
        this.setState({siderCollapsed: !this.state.siderCollapsed});
        if (this.state.siderCollapsed) {  //收起状态
            //展开状态
            this.setState({
                siderTrigger: null
            });
            this.fmMap.options.compassOffset = [278, 20];
            this.fmMap.updateSize();
        } else {
            this.setState({
                siderTrigger: undefined
            });
            this.fmMap.options.compassOffset = [28, 20];
            this.fmMap.updateSize();
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

    /**
     * 禁选开始时间
     * @param startValue
     * @returns {boolean}
     */
    disabledStartDate = (startValue) => {
        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    };

    /**
     * 禁选结束时间
     * @param endValue
     * @returns {boolean}
     */
    disabledEndDate = (endValue) => {
        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    };

    /**
     * 更新开始/结束时间
     * @param field
     * @param value
     */
    onDateChange = (field, value) => {
        this.setState({
            [field]: value,
        });
    };

    /**
     * 更新开始时间
     * @param value
     */
    onStartChange = (value) => {
        this.onDateChange('startValue', value);
    };


    /**
     * 更新结束时间
     * @param value
     */
    onEndChange = (value) => {
        let beginDate = _.cloneDeep(this.state.startValue);
        let maxEndDate = beginDate.add(1, 'd');
        if (value > maxEndDate) {
            this.onDateChange('endValue', maxEndDate);
            this.props.showErrorMessage('最多只能选择一天的轨迹回放数据');
        } else {
            this.onDateChange('endValue', value);
        }
    };

    /**
     * 开始时间
     * @param open
     */
    handleStartOpenChange = (open) => {
        if (!open) {
            this.setState({endOpen: true});
        }
    };

    /**
     * 结束时间
     * @param open
     */
    handleEndOpenChange = (open) => {
        this.setState({endOpen: open})
    };

    /**
     * 开始播放
     * @param value
     */
    onPalySliderChange = (value) => {
        this.setState({
            palySliderValue: value,
        });
    };


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

        return item[0].name;
    }

    /**
     * checkbox 点击事件，取消冒泡排序，以免人员详细信息弹出
     * @param e 事件对象
     */
    checkboxClick = (e) => {
        e.stopPropagation();
    };

    /**
     * 当前选中需要查看轨迹回放的人员
     * @param e 事件对象
     * @param personCode 当前选中人员编号
     */
    checkboxSelected = (e, personCode) => {
        e.stopPropagation();
        let selected = this.state.selectedPersonCode;
        if (e.target.checked) {
            selected.push(personCode);
        } else {
            selected = selected.filter((code) => {
                return code != personCode;
            });
        }

        this.setState({
            selectedPersonCode: selected
        });
    };


    /**
     * 全部选择
     * allSelect
     */
    allSelect = () => {
        let selectedPersonCode = [];
        this.props.peopleDataSource.map((item) => {
            selectedPersonCode.push(item.personCode);
        });
        this.setState({
            selectedPersonCode: selectedPersonCode
        })
    };

    /**
     * 全部取消
     * allCancel
     */
    allCancel = () => {
        this.setState({
            selectedPersonCode: []
        })
    };

    /**
     * 人员是否勾选状态
     * @param personCode
     * @returns {boolean}
     */
    getPersonChecked = (personCode) => {
        return this.state.selectedPersonCode.indexOf(personCode) >= 0;
    };

    /**
     * 显示/隐藏personImageMarker
     * @param personCode
     */
    visiblePersonImageMarker = (personCode) => {
        const personMarker = this.personMarkers[personCode];
        if (personMarker) {
            personMarker.visible = !personMarker.visible;

            this.setState({
                visiblePersonImage: {personCode: personCode, visible: personMarker.visible}
            })
        }
    };


    /**
     * 显示/隐藏personImageMarker
     * @param personCode
     */
    showVisiblePersonImageMarker = (personCode, visible) => {
        const personMarker = this.personMarkers[personCode];
        if (personMarker) {
            personMarker.visible = visible;

            this.setState({
                visiblePersonImage: {personCode: personCode, visible: visible}
            })
        }
    };


    /**
     * 根据人员编号移至视野中心点
     * @param personCode 需要定位的人员的编号
     */
    moveToPersionImageMarker = (personCode) => {
        const moveToCenterPersonCode = this.moveToCenterPersonCode === personCode ? '' : personCode;
        this.setState({
            moveToCenterPersonCode: moveToCenterPersonCode,
        });
        this.moveToCenterPersonCode = moveToCenterPersonCode;
    };

    /**
     * 获取菜单
     */
    getMenu = () => {
        //在线人数
        this.onLineCount = 0;
        //选择人员
        const {selectPersonList, peopleList, sPeopleList} = this.state;

        //检测用户是否在线
        peopleList.map((people) => {
            if (!this.onLineDevice) return;
            this.onLineDevice.map((device) => {
                if (device.deviceCode === people.deviceCode) {
                    people.onLine = true;
                    this.onLineCount++;
                }
            });
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

        //是否是已选人员
        if (sPeopleList !== null) {
            return sPeopleList.map((people) => {
                const personCode = people.personCode;
                const color = this.state.moveToCenterPersonCode === personCode ? '#FFC600' : '#f2f2f2';
                const visible = this.getVisiblePersonMarker(personCode);

                return (
                    <Menu.Item key={people.personCode}>
                        <Avatar size="large"
                                src={this.getImageUrl(people.avatarImgPath, people.sex)}/>
                        <div className={styles.content}>
                            <div className={styles.code}>{people.personCode}</div>
                            <div>
                                {/*<span className={people.onLine ? styles.floor : styles.floorOffline}>
                             {people.onLine ? '1F' : '离线'}
                            </span>*/}
                                {people.personName}
                            </div>
                        </div>
                        <div className={styles.operateContent}>
                            <Button onClick={(e) => {
                                this.visiblePersonImageMarker(people.personCode);
                                this.setState({moveToCenterPersonCode: ''});
                                this.moveToCenterPersonCode = '';
                            }}
                                    type="primary"
                                    icon={visible ? 'eye-o' : 'eye'}
                                    title="隐藏/可见"/>
                            <Button onClick={(e) => {
                                this.moveToPersionImageMarker(people.personCode);
                                this.showVisiblePersonImageMarker(people.personCode, true);
                            }}
                                    type="primary"
                                    style={{color: color}}
                                    icon="environment"
                                    title="定位"/>
                        </div>
                    </Menu.Item>
                )
            });
        }

        //人员菜单
        return peopleList.map((people) => {
            return (
                <Menu.Item key={people.personCode} disabled={!people.onLine}>
                    <Avatar size="large"
                            src={this.getImageUrl(people.avatarImgPath, people.sex)}/>
                    <div className={styles.content}>
                        <div className={styles.code}>{people.personCode}</div>
                        <div>
                            <span className={people.onLine ? styles.floor : styles.floorOffline}>
                             {people.onLine ? '1F' : '离线'}
                            </span>
                            {people.personName}
                        </div>
                    </div>
                    <div className={styles.btnContent}>
                        <Checkbox className={styles.peopleChk}
                                  checked={this.getPersonChecked(people.personCode)}
                                  onChange={(e) => {
                                      this.checkboxSelected(e, people.personCode);
                                  }}
                                  onClick={this.checkboxClick}>
                        </Checkbox>
                    </div>
                </Menu.Item>
            )
        })
    };

    /**
     * 开始轨迹回放
     */
    onStartPlay = () => {
        this.personMarkers.length = 0;  //清空人员marker对象数组；

        let personCodes = [];
        //所有人员列表
        const {peopleDataSource} = this.props;
        if (!peopleDataSource) return;
        //选择人员的personCode
        const selectedPersonCode = this.state.selectedPersonCode;
        //已选人员对象
        const personList = peopleDataSource.filter((item) => {
            const personCode = item.personCode;
            if (selectedPersonCode.indexOf(personCode) >= 0) {
                personCodes.push(personCode);
                return item;
            }
        });

        const startValue = this.state.startValue;   //开始时间
        const endValue = this.state.endValue;       //结束时间

        if (!startValue || !endValue) return;

        const seconds = endValue.diff(startValue, 'seconds');

        //开始时间不为空
        if (!startValue) {
            this.props.showErrorMessage('请选择开始时间');
            return;
        }

        //结束时间不为空
        if (!endValue) {
            this.props.showErrorMessage('请选择结束时间');
            return;
        }

        const ss = _.cloneDeep(startValue);
        let maxEndDate = ss.add(1, 'd');
        if (endValue > maxEndDate) {
            this.onDateChange('endValue', maxEndDate);
            this.props.showErrorMessage('最多只能选择一天的轨迹回放数据');
            return;
        }

        //选择人员不为空
        if (personList.length <= 0) {
            this.props.showErrorMessage('请选择人员');
            return;
        }

        const m = Math.floor(seconds / 60).toFixed(0);  //分钟
        const mm = ( m % 60).toFixed(0);                //秒 取余
        const s = (seconds % 60).toFixed(0);            //分钟 取余
        const h = Math.floor(m / 60).toFixed(0);        //小时

        //console.log("小时", h, '分钟', mm, "秒", s);
        //请求路径回放数据
        this.props.changeTraceReplay([personCodes.join(','), startValue.format('YYYY-MM-DD HH:mm:ss'), endValue.format('YYYY-MM-DD HH:mm:ss')]);

        this.setState({
            selectPersonList: personList,
            //totalTime: `${h}:${mm}:${s}`,
            totalTime: moment({h: h, m: mm, s: s}).format('HH:mm:ss'),
            visibleReplay: true,
            seconds: seconds,
            sPeopleList: personList
        });

        this.refs.stop.style.display = 'block';
        this.refs.start.style.display = 'none';
    };

    /**
     * 停止轨迹回放
     */
    stopPlayback = () => {
        this.refs.stop.style.display = 'none';
        this.refs.start.style.display = 'block';

        //移除选择的人员信息
        this.setState({
            selectPersonList: null,
            selectedPersonCode: [],
            visibleReplay: false,
            seconds: null,
            sPeopleList: null,
            startValue: null,
            endValue: null
        });

        //清空轨迹回放信息
        this.props.emptyTraceData();
        this.empty(this.traceReplayMap);
        this.emitEmpty();
    };
    /**
     * 地图加载完成回调函数
     */
    loadComplete = (_this) => {
        this.fmMap = _this.fmMap;
        this.traceReplayMap = _this;
        this.props.queryAreaListBegin();
    };

    /**
     * 添加人员imageMarker对象
     * @param personMarker 人员imageMarker对象
     */
    addPersonMarker = (personMarker) => {
        if (personMarker) {
            this.personMarkers[personMarker.personCode] = personMarker.imageMarker;
        }
    };

    /**
     * 获取当前personCode的imageMarker是否显示(true)/隐藏(false)状态
     * @param perosonCode
     * @returns {boolean}
     */
    getVisiblePersonMarker = (perosonCode) => {
        const personImageMarkers = this.personMarkers;
        let visibleImageMarker = false;
        if (personImageMarkers) {
            const personImageMarker = personImageMarkers[perosonCode];
            if (personImageMarker) {
                visibleImageMarker = personImageMarker.visible;
            }
        }
        return visibleImageMarker;
    };

    /**
     * 人员信息搜索（模糊搜索，根据人员名称或人员编号）
     * @parm e 事件对象
     */
    onSearchKeyword = (e) => {
        e.persist();
        this.timeStamp = e.timeStamp;
        const selectPersonList = this.state.selectPersonList;

        setTimeout(() => {
            if (this.timeStamp === e.timeStamp) {
                const value = e.target.value;
                if (!selectPersonList) {
                    const peopleList = this.getPeopleListBykeyword(value);
                    this.setState({
                        peopleList: peopleList,
                    })
                } else {
                    const selectList = this.getSelectPersonByKeyword(value);
                    this.setState({
                        sPeopleList: selectList,
                    })
                }
            }
        }, 500);
    };

    getSelectPersonByKeyword = (keyword) => {
        const selectPersonList = this.state.selectPersonList;
        let list = [];
        if (keyword) {
            keyword = keyword.toLocaleLowerCase();
            list = selectPersonList.filter((item) => {
                const personName = item.personName.toLocaleLowerCase();
                return personName.indexOf(keyword) >= 0 || personName.indexOf(keyword) >= 0;
            });
        } else {
            list = selectPersonList;
        }
        return list;
    };

    /**
     * 根据关键字搜索人员列表信息(人员名称或人员编号)
     * @keyword 搜索信息关键字
     */
    getPeopleListBykeyword = (keyword) => {
        const peopleList = this.props.peopleList;
        let list = [];
        if (keyword) {
            keyword = keyword.toLocaleLowerCase();
            list = peopleList.filter((item) => {
                const personName = item.personName.toLocaleLowerCase();
                const personCode = item.personCode.toLocaleLowerCase();
                return personName.indexOf(keyword) >= 0 || personCode.indexOf(keyword) >= 0;
            });
        } else {
            list = peopleList;
        }
        return list;
    };

    /**
     * 重置轨迹回放所有参数
     * @param _this traceReplayMap对象
     */
    empty = (_this) => {
        let {setIntervalID, naviCoords, personMarkers, naviLineMarkers, fmMap} = _this;
        _this.ss = 0;
        clearInterval(setIntervalID);

        //清除人员
        for (let item in personMarkers) {
            personMarkers[item].dispose();
            personMarkers[item] = null;
        }

        //清除路劲线
        for (let item in naviLineMarkers) {
            let naviLineMarker = naviLineMarkers[item];
            for (let key in naviLineMarker) {
                fmMap.clearLineMark(naviLineMarker[key]);
            }
            naviLineMarkers[item] = {};
        }

        //清空点
        for (let item in naviCoords) {
            naviCoords[item] = {};
        }

        _this.sec = 1000;
        _this.speedTag = '×1';
        _this.setState({
            beginTime: '00:00:00',
            play: false,
        });
    };

    /**
     * 显示/隐藏全部人员imageMarker
     * @param visible
     */
    isVisibleAllPeopleMarker = (visible) => {
        const {personMarkers, visibleNaviLineMarkers} = this.traceReplayMap;
        for (let key in personMarkers) {
            personMarkers[key].visible = visible;
            visibleNaviLineMarkers(key, visible);
        }

        if (!visible) {
            this.setState({moveToCenterPersonCode: ''});
            this.moveToCenterPersonCode = '';
        }
    };

    /**
     * 根据不同状态，获取底部操作按钮
     */
    getFooter = () => {
        const {selectPersonList} = this.state;
        if (selectPersonList) {
            return <div className={styles.allChkPanel}>
                <Button ghost size="small" icon="eye" onClick={() => {
                    this.isVisibleAllPeopleMarker(true);
                }}>全部可见</Button>
                <Button ghost size="small" icon="eye-o" onClick={() => {
                    this.isVisibleAllPeopleMarker(false);
                }}>全部隐藏</Button>
            </div>;
        } else {
            return <div className={styles.allChkPanel}>
                <Button ghost size="small" onClick={this.allSelect}>全部选择</Button>
                <Button ghost size="small" onClick={this.allCancel}>全部取消</Button>
            </div>
        }
    };

    render() {
        const {userName} = this.state;
        const suffix = userName ? <Icon type="close-circle" onClick={this.emitEmpty}/> : null;
        const {startValue, endValue, endOpen} = this.state;

        //当前人数
        const peopleDataCount = this.state.peopleList.length;
        const menu = this.getMenu();

        return (
            <Layout className={styles.layout}>
                <Sider width={256} className={styles.sider} collapsible={true}
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
                                className={styles.menu}>
                                {/*人员菜单列表*/}
                                {menu}
                            </Menu>
                        </Content>
                        <Footer className={styles.footer}>
                            <div ref='start' style={{display: 'block'}} className={styles.datePanel}>
                                <div className={styles.dtPickerItem}>开始
                                    <DatePicker
                                        disabledDate={this.disabledStartDate}
                                        showTime
                                        format="YYYY-MM-DD HH:mm"
                                        value={startValue}
                                        placeholder="开始日期"
                                        className={styles.dtPicker}
                                        onChange={this.onStartChange}
                                        onOpenChange={this.handleStartOpenChange}
                                    />
                                </div>
                                <div className={styles.dtPickerItem}>结束
                                    <DatePicker
                                        disabledDate={this.disabledEndDate}
                                        showTime
                                        format="YYYY-MM-DD HH:mm"
                                        value={endValue}
                                        placeholder="结束日期"
                                        className={styles.dtPicker}
                                        onChange={this.onEndChange}
                                        onOpenChange={this.handleEndOpenChange}
                                    /></div>
                                <div className={styles.dtPickerItem}>
                                    <Button type="danger"
                                            className={styles.startReplay}
                                            onClick={this.onStartPlay}>
                                        <Icon type="caret-right"/>开始轨迹回放
                                    </Button>
                                </div>
                            </div>
                            {/*停止回放按钮*/}
                            <div ref='stop' style={{display: 'none'}} className={styles.stopPlayback}>
                                <Button type="danger" className={styles.startReplay}
                                        onClick={this.stopPlayback}>停止回放</Button>
                            </div>
                            {/*菜单尾部*/}
                            {this.getFooter()}
                        </Footer>
                    </Layout>
                </Sider>
                <Content>
                    {/*轨迹回放地图*/}
                    <TraceReplayMap
                        //realTimeLocations={this.props.realTimeLocations}
                        loadComplete={this.loadComplete}
                        keyArea={this.props.keyArea}
                        startValue={startValue}
                        endValue={endValue}
                        totalTime={this.state.totalTime}
                        visibleReplay={this.state.visibleReplay}
                        traceDataSource={this.props.traceDataSource}
                        seconds={this.state.seconds}
                        addPersonMarker={this.addPersonMarker}
                        visiblePersonImage={this.state.visiblePersonImage}
                        moveToCenterPersonCode={this.state.moveToCenterPersonCode}
                        empty={this.empty}
                    />
                </Content>
            </Layout>
        );
    }
}

export function mapDispatchToProps(dispatch) {
    return {
        onSubmitForm: (evt) => {
            if (evt !== undefined && evt.preventDefault) evt.preventDefault();
            dispatch(loadRepos());
        },
        queryAllPeopleBegin: () => dispatch(queryAllPeopleBegin()),
        getPeopleCategory: () => dispatch(getPeopleCategory()),
        queryAreaListBegin: () => dispatch(queryAreaListBegin()),
        changeTraceReplay: (traceReplayMsg) => dispatch(changeTraceReplay(traceReplayMsg)),
        showErrorMessage: (msg) => dispatch(showErrorMessage(msg)),
        emptyTraceData: () => dispatch(emptyTraceData())
    };
}

const mapStateToProps = createStructuredSelector({
    repos: makeSelectRepos(),
    //username: makeSelectUsername(),
    loading: makeSelectLoading(),
    error: makeSelectError(),
    realTimeLocations: realTimeLocationsSelector(),
    peopleDataSource: peopleDataSourceSelector(),
    peopleCategory: peopleCategorySourceSelector(),
    onLineDevice: SelectorOnLineDevice(),
    keyArea: SelectkeyArea(),
    traceDataSource: SelectorTraceDataSource(),
    peopleList: peopleListSelector(),
});

// Wrap the component to inject dispatch and state into it
export default connect(mapStateToProps, mapDispatchToProps)(TraceReplayPage);