/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/9/22
 * @describe 轨迹回放 地图
 */
'use strict';
import React from 'react';

//antd-ui
import {Slider, Button, Icon} from 'antd';

//工具类
import moment from 'moment';    //时间
import _ from 'lodash';

import styles from './index.less';

export default class TraceReplayMap extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            allPeopleLocationMap: new Map(),
            beginTime: '00:00:00',
            play: false,
            modelView: '3D',
        };

        this.fmapID = window.fmapID;
        this.polygonMarkers = {};
        this.polygonsIds = [];
        //this.start = false; //开始/暂停
        this.setIntervalID = 0;//计时器标识；
        this.personMarkers = {};   //人员
        this.naviLineMarkers = {}; //路线
        this.naviCoords = {};
        this.ss = 0;
        this.sec = 1000;
        this.speedTag = 'x1';
        //this.playIcon = 'pause-circle';
    }

    componentDidMount = () => {
        this.initMap();
    };

    componentWillReceiveProps(nextProps) {
        //console.log('componentWillReceiveProps', this.props.visiblePersonImage, nextProps.visiblePersonImage);


        if (_.eq(this.props.keyArea, nextProps.keyArea) == false) {
            this.createPolygon(nextProps.keyArea);
        }

        //显示隐藏
        if (_.eq(this.props.visiblePersonImage, nextProps.visiblePersonImage) == false) {
            const visiblePersonImage = nextProps.visiblePersonImage;
            const personCode = visiblePersonImage.personCode;
            const visible = visiblePersonImage.visible;
            this.visibleNaviLineMarkers(personCode, visible);
            this.personMarkers[personCode].visible = visible;
        }

        //定位中心点
        if (this.props.moveToCenterPersonCode !== nextProps.moveToCenterPersonCode) {
            //console.log('nextProps.moveToCenterPersonCode', nextProps.moveToCenterPersonCode);
            const personCode = nextProps.moveToCenterPersonCode;

            const personImageMarker = this.personMarkers[personCode];
            if (personImageMarker) {
                if (this.personMarkers) {
                    //地图放大动画
                    const fmMap = this.fmMap;
                    fmMap.mapScaleLevel = {
                        level: 24,
                        duration: 1,
                        callback: function () {
                            const imageMarker = personImageMarker;
                            const coords = {x: imageMarker.x, y: imageMarker.y, groupID: 1};
                            fmMap.moveToCenter(coords);
                        }
                    };
                }
            }

            this.positionPersonCode = nextProps.moveToCenterPersonCode;

            // if (this.props.positionPersonCode) {
            //     if (locationEntity.personCode === this.props.positionPersonCode) {
            //         this.fmMap.moveToCenter({
            //             x: locationEntity.pointX,
            //             //设置imageMarker的y坐标
            //             y: locationEntity.pointY,
            //             groupID: 1
            //         });
            //     }
            // }
        }

        //if()
    };

    shouldComponentUpdate(nexrProps, nextState) {
        //判断是轨迹回放的数据是否有变化，如果有变化刷新
        return _.eq(this.props.traceDataSource, nexrProps.traceDataSource) === false || _.eq(this.state.beginTime, nextState.beginTime) === false || this.state.play !== nextState.play;
    };

    visibleNaviLineMarkers = (personCode, visible) => {
        //暂停
        clearInterval(this.setIntervalID);

        const naviLineMarker = this.naviLineMarkers[personCode];
        if (naviLineMarker) {
            for (let key in naviLineMarker) {
                let line = naviLineMarker[key];
                if (!_.isEmpty(line.brothers)) {
                    line.brothers.map((item) => {
                        item.visible = visible;
                    })
                }
                line.visible = visible;
            }
        }

        //开始
        this.setState({
            play: false,
        }, function () {
            this.tracePlay();
        });
    };

    /**
     * 初始化地图
     */
    initMap = () => {
        const {loadComplete} = this.props;
        const _this = this;

        //放大、缩小控件配置
        // const zoomCtlOpt = new fengmap.controlOptions({
        //     position: fengmap.controlPositon.RIGHT_TOP,
        //     imgURL: './img/fm_controls/',
        //     offset: {
        //         x: 15,
        //         y: 262
        //     },
        //     scaleLevelcallback: function (level, result) {
        //         console.log(result);
        //         /*当前级别：map.mapScaleLevel
        //         最小级别：map._minMapScaleLevel
        //         最大级别：map._maxMapScaleLevel*/
        //     }
        // });

        /*const ctlOpt = new fengmap.controlOptions({
            //设置显示的位置为右上角
            position: fengmap.controlPositon.RIGHT_TOP,
            showBtnCount: 5,
            allLayer: false,
            imgURL: './img/fm_controls/',
            //位置x,y的偏移量
            offset: {
                x: 15,
                y: 262
            }
        });*/

        //创建地图对象
        this.fmMap = new fengmap.FMMap({
            //渲染dom
            container: document.getElementById('fengMap'),
            //地图数据位置
            mapServerURL: 'assets/map/',
            //主题数据位置
            mapThemeURL: 'assets/theme',
            //设置主题
            defaultThemeName: '3006',        //2001, 2002, 3006, 746199
            // 默认比例尺级别设置为20级
            defaultMapScaleLevel: 20,
            //开发者申请应用下web服务的key
            key: 'b559bedc3f8f10662fe7ffdee1e360ab',
            //开发者申请应用名称
            appName: '麦钉艾特',
            //初始指北针的偏移量
            compassOffset: [278, 20],
            //指北针大小默认配置
            compassSize: 48,
            viewModeAnimateMode: true, //开启2维，3维切换的动画显示
            defaultVisibleGroups: [1],
            defaultFocusGroup: 1,
            defaultMinTiltAngle: 5,
            useStoreApply: true, //使用storeapply
        });

        //打开Fengmap服务器的地图数据和主题
        this.fmMap.openMapById(this.fmapID);
        //显示指北针
        this.fmMap.showCompass = true;

        // 点击指南针事件, 使角度归0
        this.fmMap.on('mapClickCompass', function () {
            this.rotateTo({
                to: 0,
                duration: .3,
            })
        });

        //初始化绘制插件
        this.fmMap.on('loadComplete', function () {
            this.visibleGroupIDs = [1];
            this.focusGroupID = 1;

            //楼层
            //new fengmap.scrollGroupsControl(this, ctlOpt);

            //放大、缩小控件
            //new fengmap.zoomControl(this, zoomCtlOpt);

            //2D/3D
            // new fengmap.toolControl(this, {
            //     //初始化2D模式
            //     init2D: false,
            //     position: fengmap.controlPositon.RIGHT_TOP,
            //     imgURL: '/img/fm_controls/',
            //     //设置为false表示只显示2D,3D切换按钮
            //     groupsButtonNeeded: false,
            //     offset: {
            //         x: 15,
            //         y: 210
            //     },
            //     //点击按钮的回调方法,返回type表示按钮类型,value表示对应的功能值
            //     clickCallBack: function (type, value) {
            //         console.log(type, value);
            //     }
            // });

            if (loadComplete) {
                loadComplete(_this);
            }
        });

        //点击事件
        this.fmMap.on('mapClickNode', function (event) {

        });
    };

    //更新Marker位置
    updateMark = (personCode, locationEntity) => {
        if (!this.fmMap) return;
        const personMarker = this.personMarkers[personCode];

        if (personMarker) {
            //更新ImageMarker的位置
            personMarker.moveTo({
                time: this.sec / 1000,
                //设置imageMarker的x坐标
                x: locationEntity.pointX,
                //设置imageMarker的y坐标
                y: locationEntity.pointY,
            });


            //移动到中心点
            if (this.positionPersonCode === personCode) {
                this.fmMap.moveToCenter({
                    x: locationEntity.pointX,
                    //设置imageMarker的y坐标
                    y: locationEntity.pointY,
                    groupID: 1
                });
            }

        } else {
            //创建ImageMarker
            let group = this.fmMap.getFMGroup(this.fmMap.groupIDs[0]);
            if (!group) return;
            //返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
            let imageMarkerLayer = group.getOrCreateLayer('imageMarker');
            let imageMarker = new fengmap.FMImageMarker({
                x: locationEntity.pointX,
                y: locationEntity.pointY,
                height: 0,
                //设置图片路径
                url: './img/peopleMarker.png',
                //设置图片显示尺寸
                size: 46,
                callback: () => {
                    imageMarker.alwaysShow();
                }
            });
            //添加至图层
            imageMarkerLayer.addMarker(imageMarker);
            //保存全局
            imageMarker.visible = true;
            this.personMarkers[personCode] = imageMarker;
            this.props.addPersonMarker({personCode: personCode, imageMarker: imageMarker});
        }
    };

    //添加Marker
    addMarker = (coord) => {
        if (!this.fmMap) return;
        let group = this.fmMap.getFMGroup(this.fmMap.groupIDs[0]);
        if (!group) return;
        //返回当前层中第一个imageMarkerLayer,如果没有，则自动创建
        let layer2 = group.getOrCreateLayer('imageMarker');
        let loadedCallBack = () => {
            this.imageMarker.alwaysShow();
        };
        let imageMarker = new fengmap.FMImageMarker({
            x: coord.x,
            y: coord.y,
            height: 1,
            //设置图片路径
            url: './img/peopleMarker.png',
            //设置图片显示尺寸
            size: 46,
            callback: () => {
                imageMarker.alwaysShow();
            }
        });

        layer2.addMarker(imageMarker);
    };

    /**
     * 创建地图区域polygon面
     * @param ids 创建区域面的id数组
     * @param areaList 楼层区域列表信息
     * @param focusFloorid 当前楼层gid
     */
    createPolygon = (areaList, focusFloorid = '1') => {
        //const map = this.map;
        areaList.map((area) => {
                const id = area.id;
                const polygon = JSON.parse(area.polygon);
                const polygonStyle = JSON.parse(area.areaStyle);
                let ps = [];
                polygon[0].map((p) => {
                    ps.push(this.addPolygon(p, focusFloorid, polygonStyle.backgroundColor, polygonStyle.opacity));
                });
                this.polygonMarkers[id] = ps;    //polygon对象
                this.polygonsIds.push(id);
            }
        );
    };

    /**
     * 添加polygon
     * @param points 数组坐标
     * @param focusFloorid 当前楼层
     * @param color 区域填充颜色 16进制
     * @param opacity 透明度
     * @returns {fengmap.FMPolygonMarker}
     */

    addPolygon = (points, focusFloorid, color, opacity) => {
        const map = this.fmMap;
        if (!map) return;
        const group = map.getFMGroup(focusFloorid);
        if (!group) return;
        const layer = group.getOrCreateLayer('polygonMarker');
        const polygonMarker = new fengmap.FMPolygonMarker({
            map: map,
            points: points,
            lineWidth: 1,
            color: color,
        });
        polygonMarker.setAlpha(opacity);
        polygonMarker.height = 0.5;                     //高度
        polygonMarker._ps = points;
        polygonMarker._vs = points.map(function (o, index) {
            let v = map.toSceneCoord(o);
            v.index = index;
            return v;
        });
        layer.addMarker(polygonMarker);
        return polygonMarker;
    };

    move = (time, s) => {
        const {traceDataSource} = this.props;

        let t = _.cloneDeep(time);
        const dataTime = t.add(s, 's').format('YYYY-MM-DD HH:mm:ss')

        for (let personCode in traceDataSource) {
            const data = traceDataSource[personCode];

            if (!data) continue;
            let coords = data.filter((item) => {
                return item.dataTime === dataTime;
            });

            const coord = coords[0];
            if (coord) {
                this.updateMark(personCode, coord);

                //画线
                const lineCoords = {x: coord.pointX, y: coord.pointY, z: 0};
                this.addLines(personCode, lineCoords);
                this.drawLines(personCode);
            }
        }
    };

    addLines = (personCode, lineCoords) => {
        let naviCoords = this.naviCoords[personCode];
        if (!naviCoords) {
            naviCoords = {};
        }

        let key = 0;
        if (!_.isEmpty(naviCoords)) {
            for (let i in naviCoords) {
                key = i;
            }
        }

        if (!naviCoords[key]) {
            naviCoords[key] = [lineCoords];
        } else {
            if (naviCoords[key].length === 20) {
                naviCoords[parseInt(key) + 1] = [naviCoords[key][19], lineCoords];
            } else {
                naviCoords[key].push(lineCoords);
            }
        }
        this.naviCoords[personCode] = naviCoords;
    };

    //绘制线图层
    drawLines = (personCode) => {
        const map = this.fmMap;

        let naviCoords = this.naviCoords[personCode];
        let key = 0;
        if (!_.isEmpty(naviCoords)) {
            for (let i in naviCoords) {
                key = i;
            }
        }

        const naviLineMarker = this.naviLineMarkers[personCode];
        if (!_.isEmpty(naviLineMarker) && !_.isEmpty(naviLineMarker[key])) {
            map.clearLineMark(naviLineMarker[key]);
        }

        const results = this.naviCoords[personCode][key];

        const lineStyle = {
            lineWidth: 4,
            //alpha: this.personMarkers[personCode].alpha,
            alpha: .8,
            offsetHeight: 1,
            lineType: fengmap.FMLineType.FMARROW,
            noAnimate: false,
        };

        //绘制部分
        const line = new fengmap.FMLineMarker();
        let gid = 1;
        let points = results;
        let seg = new fengmap.FMSegment();
        seg.groupId = gid;
        seg.points = points;
        line.addSegment(seg);
        let lineObject = map.drawLineMark(line, lineStyle);

        if (lineObject) {
            const lineVisible = this.personMarkers[personCode].visible;

            if (!_.isEmpty(lineObject.brothers)) {
                lineObject.brothers.map((item) => {
                    item.visible = lineVisible;
                })
            }

            lineObject.visible = lineVisible;
        }

        if (!this.naviLineMarkers[personCode]) {
            this.naviLineMarkers[personCode] = {};
        }

        this.naviLineMarkers[personCode][key] = lineObject;
    };


    tracePlay = () => {
        const {seconds, startValue} = this.props;

        let ss = this.ss;

        if (!this.state.play) {
            //开始播放
            this.setIntervalID = setInterval(() => {
                //判断是否播放完毕
                if (seconds === ss) {
                    clearInterval(this.setIntervalID);
                    return;
                }

                this.move(startValue, ss);
                const beginTime = moment(this.state.beginTime, 'HH:mm:ss').add(1, 's').format('HH:mm:ss');
                this.setState({
                    beginTime: beginTime,
                });
                ss++;
                this.ss = ss;
            }, this.sec);
            this.setState({
                play: true,
            });
            //this.start = true;
        } else {
            //暂停播放
            //this.start = false;
            this.setState({
                play: false,
            });
            clearInterval(this.setIntervalID);
        }
    };

    empty = () => {
        this.props.empty(this);
        // let {setIntervalID, naviCoords, personMarkers, naviLineMarkers, fmMap} = this;
        // this.ss = 0;
        // clearInterval(setIntervalID);
        //
        // //清除人员
        // for (let item in personMarkers) {
        //     personMarkers[item].dispose();
        //     personMarkers[item] = null;
        // }
        //
        // //清除路劲线
        // for (let item in naviLineMarkers) {
        //     let naviLineMarker = naviLineMarkers[item];
        //     for (let key in naviLineMarker) {
        //         fmMap.clearLineMark(naviLineMarker[key]);
        //     }
        //     naviLineMarkers[item] = {};
        // }
        //
        // //清空点
        // for (let item in naviCoords) {
        //     naviCoords[item] = {};
        // }
        //
        // this.sec = 1000;
        // this.speedTag = '×1';
        // this.setState({
        //     beginTime: '00:00:00',
        //     play: false,
        // });
    };

    /**
     * 路线
     */
    speed = () => {
        if (!this.state.play) {
            return;
        }
        clearInterval(this.setIntervalID);

        if (this.sec === 62.5) {
            this.sec = 2000;
        }

        this.sec = this.sec / 2;
        if (this.sec === 1000) {
            this.speedTag = '×1';
        } else if (this.sec === 500) {
            this.speedTag = '×2';
        } else if (this.sec === 250) {
            this.speedTag = '×4';
        } else if (this.sec === 125) {
            this.speedTag = '×8';
        } else if (this.sec === 62.5) {
            this.speedTag = '×16';
        }

        this.setState({
            play: false,
        }, function () {
            this.tracePlay();
        });
    };

    componentWillUnmount = () => {
        clearInterval(this.setIntervalID);
    };

    /**
     * 切换3D/2D效果；
     */
    changeModelView = () => {
        const map = this.fmMap;
        if (!map) return;
        let modelView = this.state.modelView;
        if (modelView === '3D') {
            map.viewMode = fengmap.FMViewMode.MODE_2D;
            modelView = '2D';
        } else {
            map.viewMode = fengmap.FMViewMode.MODE_3D;
            modelView = '3D';
        }
        this.setState({
            modelView: modelView
        })
    };

    setZoomIn = () => {
        const map = this.fmMap;
        if (!map) return;
        map.zoomIn();
    };

    setZoomOut = () => {
        const map = this.fmMap;
        if (!map) return;
        map.zoomOut();
    };

    render() {

        const {startValue, endValue, totalTime, visibleReplay, seconds} = this.props;

        return (
            <div style={{width: '100%', height: '100%'}}>
                <div id="fengMap" style={{width: '100%', height: '100%', positio: 'relative'}}>
                    <div style={{position: 'absolute', width: 48, right: '20px', top: '70px', display: 'flex', justifyContent: 'baseline', flexDirection: 'column'}}>
                        <span className={styles.mapActionBtn} onClick={this.changeModelView}>
                            <img src={`./img/fm_controls/${this.state.modelView}.png`}></img>
                        </span>
                        <span className={styles.mapActionBtn} onClick={this.setZoomIn}>
                            <img src="./img/fm_controls/zoomin.png"></img>
                        </span>
                        <span className={styles.mapActionBtn} onClick={this.setZoomOut}>
                            <img src="./img/fm_controls/zoomout.png"></img>
                        </span>
                    </div>
                </div>
                {/*播放器*/}
                <div className={styles.replayPanel} style={{display: visibleReplay ? 'block' : 'none'}}>
                    <div className={styles.replayItemRow}>
                        <div className={styles.playTimeTag}>
                            <span>{this.state.beginTime}</span><span> / {totalTime}</span>
                        </div>
                        <span className={styles.speedTag}>快进{this.speedTag}</span>
                    </div>
                    <Slider tipFormatter={() => {
                        return this.state.beginTime;
                    }} min={0} max={seconds} className={styles.palySlider} onChange={this.onPalySliderChange}
                            value={this.ss} step={1}/>
                    <div className={styles.replayItemRow}>
                        <div>
                            <span>{startValue ? startValue.format('YYYY-MM-DD') : ''}<br/>{startValue ? startValue.format('HH:mm:ss') : ''}</span>
                        </div>
                        <div className={styles.ctlButtons}>
                            <Button ghost size="large" onClick={() => {
                                this.tracePlay();
                            }}><Icon type={this.state.play ? 'pause-circle' : 'play-circle'}/></Button>
                            <Button ghost size="large" onClick={() => {
                                this.speed();
                            }}><Icon type="forward"/></Button>
                            <Button ghost size="large" onClick={() => {
                                this.empty();
                            }}><Icon type="minus-square"/></Button>
                        </div>
                        <div>
                            <span>{endValue ? endValue.format('YYYY-MM-DD') : ''}<br/>{endValue ? endValue.format('HH:mm:ss') : ''}</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}