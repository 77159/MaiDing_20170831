/**
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/7
 * @describe 添加人员 Reducer
 */

'use strict';
import {fromJS} from 'immutable';
import {
    PEOPLE_FORM_MODAL_SHOW,
    PEOPLE_FORM_MODAL_OP_BEGIN,
    PEOPLE_FORM_MODAL_OP_FINISH, PEOPLE_FORM_MODAL_HIDE, PEOPLE_FORM_MODAL_CREATE_PEOPLE,
    IMAGE_URL,
} from './constants';
import _ from 'lodash';

const initialState = fromJS({
    //Modal显示状态  [True]显示 [False]隐藏
    modalVisible: false,
    //人员数据
    //peopleDataSource: null,
    //操作执行状态  [True] 执行中 [False] 未执行
    operationRunning: false,
    //操作类型 [view] 查看（只读） [modify] 修改  [create] 添加
    operation: 'view',
    //人员实体对象 当操作类型为 [view | modify ] 时，需要传入人员对象
    peopleEntity: false,
    imgURL: '',
});

export default (state = initialState, action = {}) => {
    const {
        type,
        payload
    } = action;

    //对人员数据的操作（CURD）开始
    if (type === PEOPLE_FORM_MODAL_OP_BEGIN) {
        return state
            .set('operationRunning', true);
    }

    //对人员数据的操作（CURD）结束
    if (type === PEOPLE_FORM_MODAL_OP_FINISH) {
        return state
            .set('operationRunning', false);
    }

    //显示人员信息对话框
    if (type === PEOPLE_FORM_MODAL_SHOW) {
        return state
            .set('modalVisible', true)
            .set('operation', payload.operation)
            .set('peopleEntity', payload.peopleEntity)
    }

    //隐藏人员信息对话框
    if (type === PEOPLE_FORM_MODAL_HIDE) {
        return state
            .set('modalVisible', false)
            .set('operation', 'view')
            .set('peopleCode', false)
    }

    if (type === IMAGE_URL) {
        return state
            .set('imgURL', payload.imgURL);
    }

    return state;
}