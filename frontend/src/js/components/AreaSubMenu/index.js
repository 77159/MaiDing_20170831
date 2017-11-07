/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/9/13
 * @describe 区域设置树形菜单
 */
'use strict';

import React from 'react';

//antd-ui
import {Button, Icon} from 'antd';
import {Menu, Popconfirm, message} from 'antd';

//css
import styles from './index.less';

import {
    showErrorMessage,
} from "../../containers/App/actions";

const SubMenu = Menu.SubMenu;

export class AreaSubMenu extends React.Component {
    constructor(props) {
        super(props);
    }

    /**
     * 根据楼层id获取楼层下的区域列表
     * @param gid 楼层id
     * @returns {Array.<T>}
     */
    getMenuItem = (gid) => {
        const areaList = this.props.areaList;
        return areaList.filter((item) => {
            return item.floorId == gid;
        });
    };

    /**
     * 创建楼层区域
     * @param e 事件对象
     */
    createArea = (e) => {
        e.stopPropagation();
        this.props.polygonCraete();
    };

    confirm = (e, id) => {
        e.stopPropagation();
        this.props.deleteAreaById(id);
        this.props.lockForm();
        this.props.emptyAreaForm();
    };

    render() {
        const {listGroups} = this.props;

        return (
            <Menu
                mode="inline"
                openKeys={['F1']}
                onClick={(e) => {
                    this.props.queryAreaByIdBegin(e.key);
                }}
                className={styles.menu}
            >
                {
                    listGroups.map((item) => {
                        const gid = item.gid;
                        const floorName = item.gname.toUpperCase();
                        return (
                            <SubMenu key={floorName} title={
                                <section>
                                    <Icon type="appstore" className={styles.floorIcon}/>
                                    <span className={styles.floorName}>{floorName}</span>
                                    <Button onClick={
                                        (e) => {
                                            this.createArea(e);
                                        }
                                    } shape="circle" ghost className={styles.addAreaBtn}
                                            title="添加区域">
                                        <Icon type="plus"/>
                                    </Button>
                                </section>
                            }>
                                {
                                    this.getMenuItem(gid).map((item, index) => {
                                        const id = item.id;
                                        const areaName = item.areaName;
                                        return (
                                            <Menu.Item key={id}>
                                                <span className={styles.areaName}>{areaName}</span>
                                                <span className={styles.areaBtns}>
                                                        <Button shape="circle"
                                                                ghost
                                                                className={styles.areaEditBtn}
                                                                title="编辑"
                                                                onClick={() => {
                                                                    this.props.queryAreaByIdBegin(id);
                                                                    this.props.unLockForm();
                                                                }}>
                                                                <Icon type="edit"/>
                                                        </Button>
                                                        <Button shape="circle"
                                                                ghost
                                                                className={styles.areaEditBtn}
                                                                title="定位"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    this.props.moveToCenter(id);
                                                                    this.props.updatePolygonLineStyle(id);
                                                                }}>
                                                                <Icon type="environment"/>
                                                        </Button>
                                                     <Popconfirm title="确认要删除此区域设置吗？" onConfirm={(e) => {
                                                         this.confirm(e, id)
                                                     }} okText="确定" cancelText="取消">
                                                        <Button shape="circle"
                                                                ghost
                                                                className={styles.areaEditBtn}
                                                                title="删除">
                                                                <Icon type="close"/>
                                                        </Button>
                                                     </Popconfirm>
                                                </span>
                                            </Menu.Item>
                                        )
                                    })
                                }
                            </SubMenu>
                        )
                    })
                }
            </Menu>
        )
    }
}