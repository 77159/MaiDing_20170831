/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/8/6
 * @describe 人员类型管理 Actions
 */
'use strict';
import {
    GET_PEOPLECATEGORY,
    GET_PEOPLECATEGORY_FINISH,
    POST_PEOPLECATEGORY,
    DELETE_PEOPLECATEGORY,
    GET_PEOPLECATEGORYBYID,
    GET_PEOPLECATEGORYFINISH,
    PUT_PEOPLECATEGORY,
    UPDATE_OPERATIONRUNNING,
    GET_PEOPLE_CATEGORY_PARENT_BY_ID,
    GET_PEOPLE_CATEGORY_PARENT_BY_ID_FINISH,
    UPDATE_PEOPLE_CATEGORY_NAME,
    EMPTY_PEOPLE_CATEGORY_ID,
    UPDATE_PEOPLE_LEVEL_NAME
} from './constants';

/**
 * 查询人员类别
 */
export const getPeopleCategory = () => ({
    type: GET_PEOPLECATEGORY,
});

/**
 * 查询人员类型完成
 * @param peopleCategory 人员类型对象
 */
export const getPeopleCategoryFinish = (peopleCategory) => ({
    type: GET_PEOPLECATEGORY_FINISH,
    payload: peopleCategory,
});

/**
 * 添加人员类型
 * @param peopleCategory 人员类型对象
 */
export const postPeopleCategory = (peopleCategory) => ({
    type: POST_PEOPLECATEGORY,
    peopleCategory,
});

/**
 * 根据人员类型id删除人员类型
 * @param id 人员类型id
 */
export const deletePeopleCategory = (id) => ({
    type: DELETE_PEOPLECATEGORY,
    id: id,
});

/**
 * 根据人员类型id查询人员类型
 * @param id 人员类型id
 */
export const getPeopleCategoryById = (id) => ({
    type: GET_PEOPLECATEGORYBYID,
    id: id,
});

/**
 * 根据人员类型id查询人员类型
 * @param category 人员类型对象
 */
export const getPeopleCategoryByIdFinish = (category) => ({
    type: GET_PEOPLECATEGORYFINISH,
    payload: category
});

/**
 * 修改人员类型
 * @param peopleCategory 人员类型对象
 */
export const putPeopleCategory = (peopleCategory) => ({
    type: PUT_PEOPLECATEGORY,
    peopleCategory,
});

/**
 * 更新操作状态值
 * @param operationRunning 操作类型
 */
export const updateOperationrunning = (operationRunning) => ({
    type: UPDATE_OPERATIONRUNNING,
    payload: {
        operationRunning
    }
});

/**
 * 根据id获取用户父级类型
 * @param id  级别类型id
 */
export const getPeopleCategoryParentById = (id) => ({
    type: GET_PEOPLE_CATEGORY_PARENT_BY_ID,
    id: id,
});

/**
 * 根据人员类型id获取父级类型完成
 * @param category  父级别类型对象
 */
export const getPeopleCategoryParentByIdFinish = (category) => ({
    type: GET_PEOPLE_CATEGORY_PARENT_BY_ID_FINISH,
    payload: category
});

/**
 * 清空人员类型id
 * @constructor
 */
export const emptyPeopleCategoryId = () => ({
    type: EMPTY_PEOPLE_CATEGORY_ID,
});

/**
 * 更新人员类型名称
 * @param category  人员类型对象
 */
export const updatePeopleCategoryName = (parentName) => ({
    type: UPDATE_PEOPLE_CATEGORY_NAME,
    payload: {
        parentName,
    }
});

/**
 * 更新人员级别名称
 * @param name  人员级别名称
 */
export const updatePeopleLevelName = (name) => ({
    type: UPDATE_PEOPLE_LEVEL_NAME,
    payload: {
        name,
    }
});