/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  dl (duanliang@fengmap.com)
 * @date     2017/9/6
 * @describe 人员类型管理 constants，用于Action
 */
'use strict';
export const GET_PEOPLECATEGORY = 'CategoryFormModel/GET_PEOPLECATEGORY';                           //查询所有人员类型
export const GET_PEOPLECATEGORY_FINISH = 'CategoryFormModel/GET_PEOPLECATEGORY_FINISH';             //查询人员类型完成
export const POST_PEOPLECATEGORY = 'CategoryFormModel/POST_PEOPLECATEGORY';                         //添加人员类型
export const DELETE_PEOPLECATEGORY = 'CategoryFormModel/DELETE_PEOPLECATEGORY';                     //删除人员类型
export const GET_PEOPLECATEGORYBYID = 'CategoryFormModel/GET_PEOPLECATEGORYBYID';                   //根据id获取人员类型
export const GET_PEOPLECATEGORYFINISH = 'CategoryFormModel/GET_PEOPLECATEGORYFINISH';               //根据id查询人员类型完成
export const PUT_PEOPLECATEGORY = "CategoryFormModel/PUT_PEOPLECATEGORY";                           //修改人员类型
export const UPDATE_OPERATIONRUNNING = "CategoryFormModel/UPDATE_OPERATIONRUNNING";                 //更新当前操作状态
export const GET_PEOPLE_CATEGORY_PARENT_BY_ID = "CategoryFormModel/GET_PEOPLE_CATEGORY_PARENT_BY_ID";                 //根据id查询人员类型（父类型）
export const GET_PEOPLE_CATEGORY_PARENT_BY_ID_FINISH = "CategoryFormModel/GET_PEOPLE_CATEGORY_PARENT_BY_ID_FINISH";   //根据id查询人员类型（父类型）
export const UPDATE_PEOPLE_CATEGORY_NAME = "CategoryFormModel/UPDATE_PEOPLE_CATEGORY_NAME";           //更新人员类型名称
export const UPDATE_PEOPLE_LEVEL_NAME = "CategoryFormModel/UPDATE_PEOPLE_LEVEL_NAME";                  //更新人员类型名称
export const EMPTY_PEOPLE_CATEGORY_ID = "CategoryFormModel/EMPTY_PEOPLE_CATEGORY_ID";                  //清空当前id