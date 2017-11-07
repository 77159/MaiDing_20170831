/**
 * @authors  hxb (huangxuebing@fengmap.com)
 * @date     2017/9/6
 * @describe 人员管理 Actions
 */
'use strict';
import {
    PEOPLE_OP_BEGIN,
    PEOPLE_OP_FINISH,
    QUERY_ALL_PEOPLE_BEGIN,
    QUERY_ALL_PEOPLE_FINISH,
    CREATE_PEOPLE,
    MODIFY_PEOPLE,
    GET_PEOPLE,
    DELETE_PEOPLE
} from './constants';

/**
 * 对人员数据的操作开始
 */
export const peopleOpBegin = () => ({
    type: PEOPLE_OP_BEGIN
});

/**
 * 对人员数据的操作结束
 */
export const peopleOpFinish = () => ({
    type: PEOPLE_OP_FINISH
});

/**
 * 查询所有人员信息开始
 */
export const queryAllPeopleBegin = () => ({
    type: QUERY_ALL_PEOPLE_BEGIN
});

/**
 * 查询所有人员信息结束
 * @param peopleData
 */
export const queryAllPeopleFinish = (peopleData) => ({
    type: QUERY_ALL_PEOPLE_FINISH,
    payload: peopleData
});

/**
 * 添加人员
 * @param peopleEntity      待添加的人员对象
 */
export const createPeople = (peopleEntity) => ({
    type: CREATE_PEOPLE,
    payload: peopleEntity
});

/**
 * 修改人员信息
 * @param peopleEntity      要修改的人员对象
 */
export const modifyPeople = (peopleEntity) => ({
    type: MODIFY_PEOPLE,
    peopleEntity
});

/**
 * 根据人员编号，查询一个人员的的信息
 * @param peopleCode        人员编号
 */
export const getPeople = (peopleCode) => ({
    type: GET_PEOPLE,
    payload: {
        peopleCode
    }
});

/**
 * 删除人员（一个或多个）
 * @param personCodes       要删除的peopleCode数组
 */
export const deletePeople = (personCodes) => ({
    type: DELETE_PEOPLE,
    personCodes
});