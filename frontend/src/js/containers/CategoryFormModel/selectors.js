/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/8/6
 * @describe 人员类型管理 selectors
 */
'use strict';
import {createSelector} from 'reselect';

const selectorCategoryForm = (state) => state.get('categoryFormModal');

/**
 * 人员类型数据集合
 */
const peopleCategorySourceSelector = () => createSelector(
    selectorCategoryForm,
    (peopleCategoryState) => peopleCategoryState.get('peopleCategory')
);

/**
 * 人员级别id
 */
const parentIdSelector = () => createSelector(
    selectorCategoryForm,
    (peopleCategoryState) => peopleCategoryState.get('pid')
);

/**
 * 人员级别名称
 */
const parentNameSelector = () => createSelector(
    selectorCategoryForm,
    (peopleCategoryState) => peopleCategoryState.get('parentName')
);

/**
 * 人员类型名称
 */
const nameSelector = () => createSelector(
    selectorCategoryForm,
    (peopleCategoryState) => peopleCategoryState.get('name')
);

/**
 * 人员类型名称
 */
const idSelector = () => createSelector(
    selectorCategoryForm,
    (peopleCategoryState) => peopleCategoryState.get('id')
);

/**
 * 当前操作状态
 */
const operationRunningSelector = () => createSelector(
    selectorCategoryForm,
    (peopleCategoryState) => peopleCategoryState.get('operationRunning')
);

export {
    peopleCategorySourceSelector,
    parentIdSelector,
    parentNameSelector,
    operationRunningSelector,
    nameSelector,
    idSelector
};
