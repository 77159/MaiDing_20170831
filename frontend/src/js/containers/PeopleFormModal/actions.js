/**
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/7
 * @describe 添加人员 Actions
 */
'use strict';
import {
    PEOPLE_FORM_MODAL_SHOW,
    PEOPLE_FORM_MODAL_HIDE,
    PEOPLE_FORM_MODAL_OP_BEGIN,
    PEOPLE_FORM_MODAL_OP_FINISH,
    PEOPLE_FORM_MODAL_CREATE_PEOPLE,
    PEOPLE_FORM_MODAL_MODIFY_PEOPLE,
    PEOPLE_FORM_MODAL_VIEW_PEOPLE,
    IMAGE_URL
} from './constants';

/**
 * 对人员数据的操作（CURD）开始
 */
export const peopleFormModalOpBegin = () => ({
    type: PEOPLE_FORM_MODAL_OP_BEGIN
});

/**
 * 对人员数据的操作（CURD）结束
 */
export const peopleFormModalOpFinish = () => ({
    type: PEOPLE_FORM_MODAL_OP_FINISH
});

/**
 * 显示人员信息对话框
 * @param {string} operation 操作类型 [view] 查看（只读） [modify] 修改  [create] 添加
 * @param {object} peopleEntity 当操作类型为 [view | modify ] 时，需要传入人员对象
 */
export const peopleFormModalShow = (operation, peopleEntity) => ({
    type: PEOPLE_FORM_MODAL_SHOW,
    payload:{
        operation,
        peopleEntity
    }
});

/**
 * 隐藏人员信息对话框
 */
export const peopleFormModalHide=()=>({
    type:PEOPLE_FORM_MODAL_HIDE
});

/**
 * 添加一个人员
 */
export const peopleFormModalCreatePeople = () => ({
    type: PEOPLE_FORM_MODAL_CREATE_PEOPLE
});

/**
 * 修改一个人员信息
 */
export const peopleFormModalModifyPeople = ( peopleEntity) => ({
    type: PEOPLE_FORM_MODAL_MODIFY_PEOPLE,
    peopleEntity
});

/**
 * 查看（只读）一个人员的信息
 */
export const peopleFormModalViewPeople = () => ({
    type: PEOPLE_FORM_MODAL_VIEW_PEOPLE
});

export const getImgUrl = (imgURL) => ({
    type: IMAGE_URL,
    payload:{
        imgURL
    }
});