/**
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/6
 * @describe 人员管理 Reducer
 */
'use strict';
import {fromJS} from 'immutable';

import {
    CHANGE_USERNAME,
    CREATE_PEOPLE,
    MODIFY_PEOPLE,
    GET_PEOPLE,
    DELETE_PEOPLE,
    QUERY_ALL_PEOPLE_BEGIN,
    QUERY_ALL_PEOPLE_FINISH,
    PEOPLE_OP_BEGIN,
    PEOPLE_OP_FINISH
} from './constants';

// The initial state of the App
const initialState = fromJS({
    username: '',
    tableDataLoading: true,
    peopleDataSource: null,
});

export default (state = initialState, action = {}) => {
    const {type, payload} = action;
    //对人员数据的操作开始
    if (type === PEOPLE_OP_BEGIN) {
        return state
            .set('tableDataLoading', true);
    }
    //对人员数据的操作结束
    if (type === PEOPLE_OP_FINISH) {
        return state
            .set('tableDataLoading', false);
    }
    //查询所有人员信息结束
    if (type === QUERY_ALL_PEOPLE_FINISH) {
        return state
            .set('peopleDataSource', payload.list)
    }
    //添加人员
    if (type === CREATE_PEOPLE) {

    }
    //修改人员信息
    if (type === MODIFY_PEOPLE) {

    }
    //查询一个人员的信息
    if (type === GET_PEOPLE) {

    }
    //删除人员（一个或多个）
    if (type === DELETE_PEOPLE) {

    }
    return state;
}






