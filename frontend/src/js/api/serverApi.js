/**
 * Copyright 2014-2016, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  zxg (zhangxiaoguang@fengmap.com)
 * @date     2016/11/27
 * @describe API接口封装类(封装通用的请求方法)
 */
import {
    invokeServerAPI,
} from './restApi.js';

/**
 * 查询所有设备信息
 * @returns {Promise.<TResult>|*}
 */

export function queryAllDeviceAPI() {
    //在客户端进行分页处理，此处单页数据最大条数设置为1000条,以后如果超过了1000条的数量，需要调整为更大
    return invokeServerAPI(`device?pageNum=1&pageSize=1000`, 'GET', null);
}

/**
 * 查询单台设备信息
 * @param deviceCode 设备编号
 * @returns {Promise.<TResult>|*}
 */
export function queryDeviceAPI(deviceCode) {
    return invokeServerAPI(`device/${deviceCode}`, 'GET', null);
}

/**
 * 添加设备
 * @param deviceEntity 设备实体
 * @returns {Promise.<TResult>|*}
 */
export function createDeviceAPI(deviceEntity) {
    return invokeServerAPI(`device`, 'POST', deviceEntity);
}

/**
 * 删除设备（一台或多台）
 * @param deviceCodes 设备编号
 * @returns {Promise.<TResult>|*}
 */
export function deleteDevicesAPI(deviceCodes) {
    return invokeServerAPI(`device`, 'DELETE', deviceCodes);
}

/**
 * 修改设备信息
 * @param deviceEntity 设备实体对象
 * @returns {Promise.<TResult>|*}
 */
export function modifyDeviceAPI(deviceEntity) {
    return invokeServerAPI(`device/${deviceEntity.deviceCode}`, 'PUT', deviceEntity);
}


/**
 * 查询所有未被使用的设备编号
 * @returns {Promise.<TResult>|*}
 */
export function queryAllNotDeviceAPI() {
    return invokeServerAPI(`device/noused`, 'GET', null);
}

/*************************人员操作*************************/

/**
 * 查询所有人员信息
 * @returns {Promise.<TResult>|*}
 */
export function queryAllPeopleAPI() {
    return invokeServerAPI(`securityPerson`, 'GET', null);
}

/**
 * 查询单个人员信息
 * @param peopleCode  需要根据peopleCode来查询
 * @returns {Promise.<TResult>|*}
 */
export function queryPeopleAPI(peopleCode) {
    return invokeServerAPI(`securityPerson/${peopleCode}`, 'GET', null);
}

/**
 * 添加人员
 * @param peopleEntity  人员实体对象
 * @returns {Promise.<TResult>|*}
 */
export function createPeopleAPI(peopleEntity) {
    return invokeServerAPI(`securityPerson`, 'POST', peopleEntity);
}

/**
 * 删除人员
 * @param personCodes  人员编号
 * @returns {Promise.<TResult>|*}
 */
export function deletePeoplesAPI(personCodes) {
    return invokeServerAPI(`securityPerson`, 'DELETE', personCodes);
}

/**
 * 修改人员信息
 * @param peopleEntity  人员实体对象
 * @returns {Promise.<TResult>|*}
 */
export function modifyPeopleAPI(peopleEntity) {
    return invokeServerAPI(`securityPerson/${peopleEntity.personCode}`, 'PUT', peopleEntity);
}

/*************************人员类型操作*************************/

/**
 * 查询所有人员类型信息
 * @returns {Promise.<TResult>|*}
 */
export function getAllPeopleCategory() {
    return invokeServerAPI(`post`, 'GET', null);
}

/**
 * 添加所有人员类型
 * @param peopleCategory 人员类型的实体
 * @returns {Promise.<TResult>|*}
 */
export function postPeopleCategory(peopleCategory) {
    return invokeServerAPI(`post`, 'POST', peopleCategory);
}

/**
 * 删除人员类型根据     人员类型id
 * @param id
 * @returns {Promise.<TResult>|*}
 */
export function deletePeopleCategory(id) {
    return invokeServerAPI(`post/${id}`, 'DELETE', null);
}

/**
 * 根据人员类型id查询人员类型
 * @param id
 * @returns {Promise.<TResult>|*}
 */
export function getPeopleCategoryById(id) {
    return invokeServerAPI(`post/${id}`, 'GET', null);
}

/**
 * 修改人员类型
 * @param peopleCategory  人员类型的实体
 * @returns {Promise.<TResult>|*}
 */
export function putPeopleCategory(peopleCategory) {
    return invokeServerAPI(`post/${peopleCategory.id}`, 'PUT', peopleCategory);
}

/************************* 地图区域操作 *************************/

/**
 * 查询地图区域列表
 * @returns {Promise.<TResult>|*}
 */
export function queryArea() {
    return invokeServerAPI(`area`, 'GET', null);
}

/**
 * 删除地图区域
 * @param id 当前区域主键id
 * @returns {Promise.<TResult>|*}
 */
export function delteAreaById(id) {
    return invokeServerAPI(`area/${id}`, 'DELETE', null);
}

/**
 * 创建地图区域
 * @param area 地图区域实体对象
 * @returns {Promise.<TResult>|*}
 */
export function createArea(area) {
    return invokeServerAPI(`area`, 'POST', area);
}

/**
 * 根据区域主键id获取地图区域对象
 * @param id 区域主键id
 * @returns {Promise.<TResult>|*}
 */
export function queryAreaById(id) {
    return invokeServerAPI(`area?id=${id}`, 'GET', null);
}

/**
 * 更新地图区域信息
 * @param area 地图区域对象
 * @returns {Promise.<TResult>|*}
 */
export function modifyArea(area) {
    return invokeServerAPI(`area/${area.id}`, 'PUT', area);
}


/************************* 人员登陆操作 *************************/
/**
 * @param loginMsg 人员登陆信息对象
 * @returns {Promise.<TResult>|*}
 */
export function changeUsernameAPI(loginMsg) {
    return invokeServerAPI(`user/login`, 'POST', loginMsg);
}

/**
 * @param passwordMsg 修改密码信息对象
 * @returns {Promise.<TResult>|*}
 */
export function modifyPasswordAPI(passwordMsg) {
    return invokeServerAPI(`user/getpass`, 'PUT', passwordMsg);
}

/**
 * 登出
 * @returns {Promise.<TResult>|*}
 */
export function loginOutAPI() {
    return invokeServerAPI(`user/logout`, 'POST');
}

/************************* 轨迹回放 *************************/
/**
 * 轨迹回放
 * @returns {Promise.<TResult>|*}
 */
export function traceReplayAPI(traceReplayMsg) {
    return invokeServerAPI(`securityPerson/history?persons=${traceReplayMsg[0]}&beginTime=${traceReplayMsg[1]}&endTime=${traceReplayMsg[2]}`, 'GET');
}