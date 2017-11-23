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
 * @describe 主界面 Reducer
 */


'use strict';
import {fromJS} from 'immutable';

import {
    RECEIVED_PEOPLE_LOCATION,
    GET_ONLINE_PEOPLE,
    GET_ONLINE_DEVICE,
    PUSH_ALARM_MESSAGE,
    PUT_MESSAGE_ISREAD,
    PUT_MESSAGE_LASTDATETIME,
    PUT_MESSAGE_ISAREA,
    PUT_MESSAGE_ISSHOW,
    OFF_LINE,
    ON_LINE,
    UPDATE_ONLINE_DEVICE
} from './constants';

// The initial state of the App
const initialState = fromJS({
    loading: false,
    error: false,
    realTimeLocations: null,    //实时位置信息
    onlinePeople: null,
    onlineDevice: null,         //获取当前最新设备
    alertMessageData: [],       //报警数据
    isReadCount: 0,             //已读条数
    online: [],
    offline: ['111'],
});


export default (state = initialState, action = {}) => {
    const {
        type,
        payload
    } = action;

    //接收实时位置信息
    if (type === RECEIVED_PEOPLE_LOCATION) {
        return state.set('realTimeLocations', payload);
    }

    //接收在线人员设备
    if (type === GET_ONLINE_PEOPLE) {
        return state.set('onlinePeople', payload);
    }

    //接受当前最新设备
    if (type === GET_ONLINE_DEVICE) {
        return state.set('onlineDevice', payload);
    }

    //接受当前报警信息
    if (type === PUSH_ALARM_MESSAGE) {
        let alertMessageData = state.get('alertMessageData');
        return state.set('alertMessageData', alertMessageData.push(payload));
    }

    //已读信息
    if (type === PUT_MESSAGE_ISREAD) {
        let alertMessageData = state.get('alertMessageData');
        alertMessageData.forEach((item) => {
            if (item.key === payload) {
                item.isRead = 1;
            }
        });
    }

    //更新报警最后更新时间
    if (type === PUT_MESSAGE_LASTDATETIME) {
        let alertMessageData = state.get('alertMessageData');
        alertMessageData.forEach((item) => {
            if (item.key === payload.id) {
                item.lastDateTime = payload.lastDateTime;
            }
        });
    }

    //更新是人员是否在重点区域
    if (type === PUT_MESSAGE_ISAREA) {
        let alertMessageData = state.get('alertMessageData');
        alertMessageData.forEach((item) => {
            if (item.id === payload.id && item.isArea) {
                item.isArea = payload.isArea;
            }
        });
    }

    //更新警告信息是否已经弹出信息框
    if (type === PUT_MESSAGE_ISSHOW) {
        let alertMessageData = state.get('alertMessageData');
        alertMessageData.forEach((item) => {
            if (item.id === payload.id && item.isShow) {
                item.isShow = payload.isShow;
            }
        });
    }

    //下线
    if (type === OFF_LINE) {
        let online = state.get('offline');
        return state.set('offline', online.push(payload));
    }

    //上线
    if (type === ON_LINE) {
        let online = state.get('online');
        return state.set('online', online.push(payload));
    }

    //更新最新设备
    if (type === UPDATE_ONLINE_DEVICE) {
        let onlineDevice = state.get('onlineDevice');
        const {code, type} = payload;
        let device = [];
        if (type === 'off') {
            device = onlineDevice.filter((item) => {
                return code !== item.personCode;
            });
        }
        if (type === 'on') {
            device.push(code);
        }
        return state.set('onlineDevice', device);
    }

    return state;
}

