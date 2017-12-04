/**
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/6
 * @describe 添加人员 Sagas
 */

'use strict';
import {take, call, put, select, cancel, takeLatest, takeEvery} from 'redux-saga/effects';

import {
    PEOPLE_FORM_MODAL_SHOW,
    PEOPLE_FORM_MODAL_HIDE,
    PEOPLE_FORM_MODAL_OP_BEGIN,
    PEOPLE_FORM_MODAL_OP_FINISH,
    PEOPLE_FORM_MODAL_CREATE_PEOPLE,
    PEOPLE_FORM_MODAL_MODIFY_PEOPLE,
    PEOPLE_FORM_MODAL_VIEW_PEOPLE,
} from './constants';

import {
    peopleFormModalHide,
    peopleFormModalOpBegin,
    peopleFormModalOpFinish,
} from './actions';

import {
    showErrorMessage,
    showSuccessMessage
} from "../App/actions";

import {createPeopleAPI, modifyPeopleAPI} from '../../api/serverApi';
import {LOCATION_CHANGE} from 'react-router-redux';
import requestError from "../../utils/requestError";
import {queryAllPeopleBegin} from "../PeopleMgrPage/actions";
import {queryAllNotDeviceBegin} from "../DeviceMgrPage/actions";

/**
 * 添加人员
 */
export function* createPeopleSaga(action) {
    try {
        //操作开始，更新loading的state
        yield put(peopleFormModalOpBegin());
        //发起异步网络请求，并获取返回结果
        const response = yield call(createPeopleAPI, action.payload);
        //是否发生了错误，或者请求失败
        if (!response || response.success == false) {
            //TODO 此处以后要对应接口的错误码，目前只能显示一种错误类型
            if(response.error_code === 200101) {
                yield put(showErrorMessage(requestError.CREATE_PEOPLE_NUM_ERROR));        //提示错误信息
            }
        } else {
            yield put(showSuccessMessage(requestError.CREATE_PEOPLE_SUCCESS));   //提示成功信息
            //关闭窗口
            yield put(peopleFormModalHide());
            //人员管理页面的数据重新加载 
            yield put(queryAllPeopleBegin());
            yield put(queryAllNotDeviceBegin());
        }
    } catch (error) {
        console.log(error);
        //异常提示
        yield put(showErrorMessage(requestError.REQUEST_ERROR));
    }
    //结束请求操作，更新loading的state
    yield put(peopleFormModalOpFinish());

}

/*
 * 修改人员信息
 * */
export function* modifyPeopleSaga(action) {
    try {
        //操作开始，更新loading的state
        yield put(peopleFormModalOpBegin());
        //发起异步网络请求，并获取返回结果
        const response = yield call(modifyPeopleAPI, action.peopleEntity);
        //是否发生了错误，或者请求失败
        if (!response || response.success == false) {
            //TODO 此处以后要对应接口的错误码，目前只能显示一种错误类型
            yield put(showErrorMessage(requestError.MODIFY_PEOPLE_ERROR));       //提示错误信息
        } else {
            yield put(showSuccessMessage(requestError.MODIFY_PEOPLE_SUCCESS));   //提示成功信息
            //关闭窗口
            yield put(peopleFormModalHide());
            //人员管理页面的数据重新加载
            yield put(queryAllPeopleBegin());
            yield put(queryAllNotDeviceBegin());
        }
    } catch (error) {
        console.log(error);
        //异常提示
        yield put(showErrorMessage(requestError.REQUEST_ERROR));
    }
    //结束请求操作，更新loading的state
    yield put(peopleFormModalOpFinish());
}


export function* watchFetchData() {
    //设置监听
    const createPeopleWatcher = yield takeLatest(PEOPLE_FORM_MODAL_CREATE_PEOPLE, createPeopleSaga);
    //当发生页面切换动作时，中断未完成的saga动作
    yield take([LOCATION_CHANGE]);
    yield cancel(createPeopleWatcher);
}

export default [
    watchFetchData
];