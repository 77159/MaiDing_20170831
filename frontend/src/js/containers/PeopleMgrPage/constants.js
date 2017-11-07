/**
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/6
 * @describe 人员管理 constants，用于Action
 *
 * CONSTANT的定义请遵循以下格式：
 * export const YOUR_ACTION_CONSTANT = 'YourContainer/YOUR_ACTION_CONSTANT';
 *
 */
'use strict';
export const CHANGE_USERNAME = 'boilerplate/Home/CHANGE_USERNAME';

export const PEOPLE_OP_BEGIN = 'PeopleMgr/PEOPLE_OP_BEGIN';                         //对人员数据的操作开始
export const PEOPLE_OP_FINISH = 'PeopleMgr/PEOPLE_OP_FINISH';                       //对人员数据的操作结束
export const QUERY_ALL_PEOPLE_BEGIN = 'PeopleMgr/QUERY_ALL_PEOPLE_BEGIN';           //查询所有设备信息开始
export const QUERY_ALL_PEOPLE_FINISH = 'PeopleMgr/QUERY_ALL_PEOPLE_FINISH';         //查询所有设备信息结束
export const CREATE_PEOPLE = 'PeopleMgr/CREATE_PEOPLE';                             //添加人员
export const MODIFY_PEOPLE = 'PeopleMgr/MODIFY_PEOPLE';                             //修改人员信息
export const GET_PEOPLE = 'PeopleMgr/GET_PEOPLE';                                   //查询一个人员的信息
export const DELETE_PEOPLE = 'PeopleMgr/DELETE_PEOPLE';                             //删除人员（一个或多个）
