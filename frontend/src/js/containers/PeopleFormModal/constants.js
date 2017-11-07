/**
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/7
 * @describe 添加人员 constants，用于Action
 *
 * CONSTANT的定义请遵循以下格式：
 * export const YOUR_ACTION_CONSTANT = 'YourContainer/YOUR_ACTION_CONSTANT';
 *
 */
'use strict';
export const PEOPLE_FORM_MODAL_SHOW = 'PeopleFormModal/PEOPLE_FORM_MODAL_SHOW';                    //显示人员信息对话框
export const PEOPLE_FORM_MODAL_HIDE = 'PeopleFormModal/PEOPLE_FORM_MODAL_HIDE';                    //隐藏人员信息对话框
export const PEOPLE_FORM_MODAL_OP_BEGIN = 'PeopleFormModal/PEOPLE_FORM_MODAL_OP_BEGIN';            //对人员数据的操作（CURD）开始
export const PEOPLE_FORM_MODAL_OP_FINISH = 'PeopleFormModal/PEOPLE_FORM_MODAL_OP_FINISH';          //对人员数据的操作（CURD）结束
export const PEOPLE_FORM_MODAL_CREATE_PEOPLE = 'PeopleFormModal/PEOPLE_FORM_MODAL_CREATE_PEOPLE';  //添加一个人员
export const PEOPLE_FORM_MODAL_MODIFY_PEOPLE = 'PeopleFormModal/PEOPLE_FORM_MODAL_MODIFY_PEOPLE';  //修改一个人员信息
export const PEOPLE_FORM_MODAL_VIEW_PEOPLE = 'PeopleFormModal/PEOPLE_FORM_MODAL_VIEW_PEOPLE';      //查看（只读）一个人员的信息
export const IMAGE_URL = 'PeopleFormModal/IMAGE_URL';      //查看（只读）一个人员的信息