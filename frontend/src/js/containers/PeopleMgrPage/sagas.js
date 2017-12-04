/**
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/6
 * @describe 人员管理 Sagas
 */
'use strict';
import {take, call, put, select, cancel, takeLatest} from 'redux-saga/effects';

import {
    CREATE_PEOPLE,
    MODIFY_PEOPLE,
    PEOPLE_OP_BEGIN,
    PEOPLE_OP_FINISH,
    QUERY_ALL_PEOPLE_BEGIN,
    QUERY_ALL_PEOPLE_FINISH,
    DELETE_PEOPLE
} from './constants';

import {
    peopleOpBegin,
    peopleOpFinish,
    queryAllPeopleBegin,
    queryAllPeopleFinish,
} from './actions';

import {
    showErrorMessage,
    showSuccessMessage
} from "../App/actions";
import requestError from "../../utils/requestError";
import {queryAllPeopleAPI, deletePeoplesAPI} from '../../api/serverApi';
import {LOCATION_CHANGE} from 'react-router-redux';
import {createPeopleSaga} from "../PeopleFormModal/sagas";
import {modifyPeopleSaga} from "../PeopleFormModal/sagas";

/**
 * 获取所有人员数据
 */
export function* queryAllPeopleSaga() {
    try {
        //操作开始，更新loading的state
        yield put(peopleOpBegin());
        //发起异步网络请求，并获取返回结果
        const response = yield call(queryAllPeopleAPI);
        //判断是否发生错误并处理
        if (!response || response.success == false) {
            yield put(showErrorMessage(requestError.GET_DATA_ERROR));   //提示错误信息
        } else {
            //成功拿到数据时，返回结果数据，让redux来更新state
            yield put(queryAllPeopleFinish(response));
        }
    } catch (err) {
        console.log(err);
        yield put(showErrorMessage(requestError.REQUEST_ERROR));
    }
    //结束请求操作，更新loading的state
    yield put(peopleOpFinish());
}

//删除
export function* delPeopleSaga(action) {
    try {
        const response = yield call(deletePeoplesAPI, {personCodes: action.personCodes});
        //判断是否发生错误并处理
        if (!response || response.success == false) {
            yield put(showErrorMessage(requestError.DELETE_PEOPLE_ERROR));   //提示错误信息
        } else {
            yield put(showSuccessMessage(requestError.DELETE_PEOPLE_SUCCESS))
        }
    } catch (err) {
        console.log(err);
        yield put(showErrorMessage(requestError.REQUEST_ERROR));
    }
    yield put(queryAllPeopleBegin());
}

export function* watchFetchData() {
    //设置监听
    const queryAllPeopleWatcher = yield takeLatest(QUERY_ALL_PEOPLE_BEGIN, queryAllPeopleSaga);
    //设置监听
    const createPeopleWatcher = yield takeLatest(CREATE_PEOPLE, createPeopleSaga);
    //监听修改人员
    const modifyWatcher = yield takeLatest(MODIFY_PEOPLE, modifyPeopleSaga);

    //设置监听 删除
    const watcherDelPeople = yield takeLatest(DELETE_PEOPLE, delPeopleSaga);

    //当发生页面切换动作时，中断未完成的saga动作
    yield take([LOCATION_CHANGE]);
    yield cancel(queryAllPeopleWatcher);
    yield cancel(createPeopleWatcher);
    yield cancel(modifyWatcher);
    yield cancel(watcherDelPeople);

}

// Bootstrap sagas
export default [
    watchFetchData,
];
