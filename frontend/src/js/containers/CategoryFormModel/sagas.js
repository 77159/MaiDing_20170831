/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/8/6
 * @describe 人员类型管理 Sagas
 */
'use strict';
import {take, call, put, cancel, takeLatest} from 'redux-saga/effects';

import {
    GET_PEOPLECATEGORY,
    POST_PEOPLECATEGORY,
    DELETE_PEOPLECATEGORY,
    GET_PEOPLECATEGORYBYID,
    PUT_PEOPLECATEGORY,
    GET_PEOPLE_CATEGORY_PARENT_BY_ID,
} from './constants';

import {
    getPeopleCategory,
    getPeopleCategoryFinish,
    getPeopleCategoryByIdFinish,
    updateOperationrunning,
    getPeopleCategoryParentByIdFinish,
} from './actions';

import {
    showErrorMessage,
    showSuccessMessage
} from "../App/actions";
import requestError from "../../utils/requestError";
import {
    getAllPeopleCategory,
    postPeopleCategory,
    deletePeopleCategory,
    getPeopleCategoryById,
    putPeopleCategory,
} from '../../api/serverApi';
import {LOCATION_CHANGE} from 'react-router-redux';

/**
 * 获取人员类型
 */
export function* getAllPeopleCategorySaga() {
    try {
        const response = yield call(getAllPeopleCategory);
        //判断是否发生错误并处理
        if (!response || response.success == false) {
            yield put(showErrorMessage(response.error_message));   //提示信息
        } else {
            yield put(getPeopleCategoryFinish(response));
        }
    } catch (err) {
        yield put(showErrorMessage(requestError.GET_PEOPLECATEGORY_ERROR)); //提示信息
    }
}

/**
 * 添加人员类型
 * @param action
 */
export function* postPeopleCategorySaga(action) {
    try {
        //操作开始
        yield put(updateOperationrunning(true));
        const response = yield call(postPeopleCategory, action.peopleCategory);
        //判断是否发生错误并处理
        if (!response || response.success == false) {
            yield put(showErrorMessage(response.error_message));   //提示信息
        } else {
            yield put(showSuccessMessage(requestError.POST_PEOPLECATEGORY_SUCCESS));   //提示信息
        }
    } catch (err) {
        yield put(showErrorMessage(requestError.POST_PEOPLECATEGORY_ERROR));
    }

    //重新加载人员类型列表
    yield put(getPeopleCategory());
    //操作结束
    yield put(updateOperationrunning(false));
}

/**
 * 删除人员类型
 * @param action
 */
export function* deletePeopleCategorySaga(action) {
    try {
        const response = yield call(deletePeopleCategory, action.id);
        //判断是否发生错误并处理
        if (!response || response.success == false) {
            yield put(showErrorMessage(requestError.error_message));   //提示错误信息
        } else {
            yield put(showSuccessMessage(requestError.DELETE_PEOPLECATEGORY_SUCCESS));
        }
    } catch (err) {
        console.log(err);
        yield put(showErrorMessage(requestError.DELETE_PEOPLECATEGORY_ERROR));
    }
    //重新加载人员类型列表
    yield put(getPeopleCategory());
}

/**
 * 根绝id获取人员类型对象
 * @param action
 */
export function* getPeopleCategoryByIdSaga(action) {
    try {
        const response = yield call(getPeopleCategoryById, action.id);
        //判断是否发生错误并处理
        if (!response || response.success == false) {
            yield put(showErrorMessage(requestError.error_message));   //提示错误信息
        } else {
            yield put(getPeopleCategoryByIdFinish(response));
        }
    } catch (err) {
        yield put(showErrorMessage(requestError.GET_PEOPLECATEGORY_ERROR)); //提示信息
    }
}

/**
 * 修改人员类型对象
 * @param action
 */
export function* putPeopleCategorySaga(action) {
    try {
        yield put(updateOperationrunning(true));
        const response = yield call(putPeopleCategory, action.peopleCategory);
        //判断是否发生错误并处理
        if (!response || response.success == false) {
            yield put(showErrorMessage(response.error_message));       //提示错误信息
        } else {
            yield put(showSuccessMessage(requestError.PUT_PEOPLECATEGORY_SUCCESS));   //提示错误信息
        }
    } catch (err) {
        yield put(showErrorMessage(requestError.PUT_PEOPLECATEGORY_ERROR));
    }
    yield put(getPeopleCategory());

    yield put(updateOperationrunning(false));
}

/**
 * 根据人员类型id查询人员类型
 * @param action
 */
export function* getPeopleCategoryParentByIdSaga(action) {
    try {
        const response = yield call(getPeopleCategoryById, action.id);
        //判断是否发生错误并处理
        if (!response || response.success == false) {
            yield put(showErrorMessage(requestError.error_message));   //提示错误信息
        } else {
            yield put(getPeopleCategoryParentByIdFinish(response));
        }
    } catch (err) {
        yield put(showErrorMessage(requestError.GET_PEOPLECATEGORY_ERROR)); //提示信息
    }
}


/**
 * 监听
 */
export function* watchFetchData() {
    //监听 查询人员类型列表
    const watchGetPeopleCategory = yield takeLatest(GET_PEOPLECATEGORY, getAllPeopleCategorySaga);
    //监听 添加人员类型
    const watchAddPeopleCategory = yield takeLatest(POST_PEOPLECATEGORY, postPeopleCategorySaga);
    //监听 删除人员类型
    const watchDeletePeopleCategory = yield takeLatest(DELETE_PEOPLECATEGORY, deletePeopleCategorySaga);
    //监听 根据id查询人员类型对象
    const watchGetPeopleCategoryById = yield  takeLatest(GET_PEOPLECATEGORYBYID, getPeopleCategoryByIdSaga);
    //监听 修改人员类型
    const watchPutPeopleCategory = yield  takeLatest(PUT_PEOPLECATEGORY, putPeopleCategorySaga);
    //监听 根据id查询人员父类型
    const watchGetPeopleCategoryParentById = yield  takeLatest(GET_PEOPLE_CATEGORY_PARENT_BY_ID, getPeopleCategoryParentByIdSaga);
    //当发生页面切换动作时，中断未完成的saga动作
    yield take([LOCATION_CHANGE]);

    yield cancel(watchGetPeopleCategory);
    yield cancel(watchAddPeopleCategory);
    yield cancel(watchDeletePeopleCategory);
    yield cancel(watchGetPeopleCategoryById);
    yield cancel(watchPutPeopleCategory);
    yield cancel(watchGetPeopleCategoryParentById);
}

// Bootstrap sagas
export default [
    watchFetchData,
];
