webpackJsonp([2],{1174:function(E,P,e){"use strict";Object.defineProperty(P,"__esModule",{value:!0});P.CHANGE_USERNAME="boilerplate/Home/CHANGE_USERNAME",P.PEOPLE_OP_BEGIN="PeopleMgr/PEOPLE_OP_BEGIN",P.PEOPLE_OP_FINISH="PeopleMgr/PEOPLE_OP_FINISH",P.QUERY_ALL_PEOPLE_BEGIN="PeopleMgr/QUERY_ALL_PEOPLE_BEGIN",P.QUERY_ALL_PEOPLE_FINISH="PeopleMgr/QUERY_ALL_PEOPLE_FINISH",P.CREATE_PEOPLE="PeopleMgr/CREATE_PEOPLE",P.MODIFY_PEOPLE="PeopleMgr/MODIFY_PEOPLE",P.GET_PEOPLE="PeopleMgr/GET_PEOPLE",P.DELETE_PEOPLE="PeopleMgr/DELETE_PEOPLE"},293:function(E,P,e){"use strict";Object.defineProperty(P,"__esModule",{value:!0});var _=e(63),L=e(1174),O=(0,_.fromJS)({username:"",tableDataLoading:!0,peopleDataSource:null});P.default=function(){var E=arguments.length>0&&void 0!==arguments[0]?arguments[0]:O,P=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},e=P.type,_=P.payload;return e===L.PEOPLE_OP_BEGIN?E.set("tableDataLoading",!0):e===L.PEOPLE_OP_FINISH?E.set("tableDataLoading",!1):e===L.QUERY_ALL_PEOPLE_FINISH?E.set("peopleDataSource",_.list):(L.CREATE_PEOPLE,L.MODIFY_PEOPLE,L.GET_PEOPLE,L.DELETE_PEOPLE,E)}}});
//# sourceMappingURL=2.js.map