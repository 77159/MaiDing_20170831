/**
 * Copyright 2014-2017, FengMap, Ltd.
 * All rights reserved.
 *
 * @authors  zxg (zhangxiaoguang@fengmap.com)
 * @date     2017/8/1
 * @describe 系统配置文件
 */
'use strict';

export const AppConfig = {
    //后台接口服务地址
    //serviceUrl: 'http://192.168.1.97:8080/fm_csv/',
    serviceUrl: 'http://123.56.157.161:8082/fm_csv/',
    //serviceUrl: 'http://localhost:8080/fm_csv/',
    //token: '',
    get token() {
        return document.cookie;
    },
    // set token(value) {
    //     this._token = value;
    // },
    get fmapID() {
        return 'md-xm-one-57-59';
        // return '10347';
    },

    get userName() {
        //let user = cookies.getItem(this.fmUserDisplayName);
        //if (!user || user == '') user = '未登录';
        //return decodeURIComponent(user) || '未登录';
        return '管理员';
    }
};