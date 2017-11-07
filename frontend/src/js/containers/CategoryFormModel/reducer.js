/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/9/6
 * @describe 人员类型管理 Reducer
 */
'use strict';
import {fromJS} from 'immutable';

import {
    GET_PEOPLECATEGORY_FINISH,
    GET_PEOPLECATEGORYFINISH,
    UPDATE_OPERATIONRUNNING,
    GET_PEOPLE_CATEGORY_PARENT_BY_ID_FINISH,
    UPDATE_PEOPLE_CATEGORY_NAME,
    UPDATE_PEOPLE_LEVEL_NAME,
    EMPTY_PEOPLE_CATEGORY_ID
} from './constants';

const initialState = fromJS({
    peopleCategory: [],     //当前所有人员类型
    id: '',                     //人员类型id
    pid: '',                    //人员类型pid
    parentName: '',           //人员类型
    name: '',              //级别类型
    operationRunning: false,    //操作状态
});

export default (state = initialState, action = {}) => {
    const {type, payload} = action;

    //查询所有人员类型对象
    if (type === GET_PEOPLECATEGORY_FINISH) {
        return state.set('peopleCategory', payload.list);
    }

    //根据id查询人员类型对象完成
    if (type === GET_PEOPLE_CATEGORY_PARENT_BY_ID_FINISH) {
        const value = payload.value;
        return state.set('pid', value.id).set('parentName', value.name)
    }

    //根据id查询人员类型
    if (type === GET_PEOPLECATEGORYFINISH) {
        const value = payload.value;
        return state.set('id', value.id).set('name', value.name).set('parentName', value.parentName).set('pid', value.parentId);
    }

    //更新当前操作状态
    if (type === UPDATE_OPERATIONRUNNING) {
        return state.set('operationRunning', payload.operationRunning)
    }

    //更新当前最新的人员类型名称
    if (type === UPDATE_PEOPLE_CATEGORY_NAME) {
        const parentName = payload.parentName;
        return state.set('parentName', parentName);
    }

    //更新当前人员级别名称
    if (type === UPDATE_PEOPLE_LEVEL_NAME) {
        const name = payload.name;
        return state.set('name', name);
    }

    //清空人员类型id
    if (type === EMPTY_PEOPLE_CATEGORY_ID) {
        return state.set('id', '')
    }

    return state;
}