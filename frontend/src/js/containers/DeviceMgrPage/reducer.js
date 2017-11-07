/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * The reducer takes care of our data. Using actions, we can change our
 * application state.
 * To add a new action, add it to the switch statement in the reducer function
 *
 * Example:
 * case YOUR_ACTION_CONSTANT:
 *   return state.set('yourStateVariable', true);
 *
 * @authors  zxg (zhangxiaoguang@fengmap.com)
 * @date     2017/8/6
 * @describe 设备管理 Reducer
 */


'use strict';
import {fromJS} from 'immutable';

import {
    CREATE_DEVICE,
    MODIFY_DEVICE,
    GET_DEVICE,
    DELETE_DEVICE,
    DEVICE_OP_BEGIN,
    DEVICE_OP_FINISH,
    QUERY_ALL_DEVICE_FINISH,
    QUERY_ALL_NOT_DEVICE_FINISH
} from './constants';
import _ from 'lodash';

const initialState = fromJS({
    //表格数据加载状态  【True】加载中 【False】加载完成
    tableDataLoading: true,
    //设备数据
    deviceDataSource: null,
    notDeviceDataSource:null,
});


export default (state = initialState, action = {}) => {
    const {
        type,
        payload
    } = action;

    //对设备数据的操作（CURD）开始
    if (type === DEVICE_OP_BEGIN) {
        return state
            .set('tableDataLoading', true);
    }

    //对设备数据的操作（CURD）结束
    if (type === DEVICE_OP_FINISH) {
        return state
            .set('tableDataLoading', false);
    }

    //查询所有设备信息-结束
    if (type === QUERY_ALL_DEVICE_FINISH) {
        return state
            .set('deviceDataSource', payload.list);
    }

    //添加设备
    if (type === CREATE_DEVICE) {

    }

    //修改设备信息
    if (type === MODIFY_DEVICE) {

    }

    //查询一个设备的信息
    if (type === GET_DEVICE) {

    }

    //删除设备（一个或多个）
    if (type === DELETE_DEVICE) {

    }

    //查询所有未被使用的设备信息-结束
    if (type === QUERY_ALL_NOT_DEVICE_FINISH) {
        return state
            .set('notDeviceDataSource', payload.list);
    }

    return state;
}