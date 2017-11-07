/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/9/12
 * @describe 人员类型二级树菜单
 */
'use strict';

import React from 'react';

//antd-ui
import {Popconfirm, Button, Icon} from 'antd';
import {Menu} from 'antd';

//css
import styles from './index.less';

const SubMenu = Menu.SubMenu;

export class CategorySubMenu extends React.Component {

    constructor(props) {
        super(props);
    }

    confirm = (e, id) => {
        e.stopPropagation();
        this.props.deletePeopleCategory(id, 'category');
    };

    render() {
        const {peopleCategory} = this.props;    //数据源

        return (
            <Menu
                mode="inline"
                className={styles.menu}
                //openKeys={[]}
            >
                {
                    peopleCategory.map((item, index) => {
                        let childrenList = item.childrenList;
                        let pid = item.id;

                        return (
                            <SubMenu key={index} title={
                                <section>
                                    <span className={styles.floorName}>{item.name}</span>
                                    <Button shape="circle" ghost className={styles.areaEditBtn}
                                            title="添加级别" onClick={(e) => {
                                        e.stopPropagation();
                                        this.props.createPeopleLevel(pid);
                                    }}>
                                        <Icon type="plus"/>
                                    </Button>
                                    <Button shape="circle" ghost className={styles.areaEditBtn}
                                            title="编辑" onClick={(e) => {
                                        e.stopPropagation();
                                        this.props.modifyPeopleCategory(pid, 'category');
                                    }}>
                                        <Icon type="edit"/>
                                    </Button>
                                    <Popconfirm title="确认要删除此类别？" okText="确定" cancelText="取消" onConfirm={(e) => {
                                        e.stopPropagation();
                                        this.confirm(e, pid);
                                    }}>
                                        <Button shape="circle" ghost className={styles.areaEditBtn}
                                                title="删除" onClick={(e) => {
                                            e.stopPropagation();
                                        }}>
                                            <Icon type="close"/>
                                        </Button>
                                    </Popconfirm>
                                </section>
                            }>
                                {childrenList.map((item, index) => {
                                    var id = item.id;
                                    return (
                                        <Menu.Item key={index}>
                                            <span className={styles.areaName}>{item.name}</span>
                                            <span className={styles.areaBtns}>
                                                <Button shape="circle" ghost className={styles.areaEditBtn}
                                                        title="编辑"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            this.props.modifyPeopleCategory(id, 'level');
                                                        }}>
                                                    <Icon type="edit"/>
                                                </Button>
                                                  <Popconfirm title="确认要删除此类别？" okText="确定" cancelText="取消" onConfirm={(e) => {
                                                      e.stopPropagation();
                                                      this.props.deletePeopleCategory(id, 'level');
                                                  }}>
                                                <Button shape="circle" ghost className={styles.areaEditBtn}
                                                        title="删除" onClick={(e) => {
                                                    e.stopPropagation();
                                                }}>
                                                <Icon type="close"/>
                                                </Button>
                                                  </Popconfirm>
                                            </span>
                                        </Menu.Item>
                                    )
                                })}
                            </SubMenu>
                        )
                    })
                }
            </Menu>
        )
    }
}