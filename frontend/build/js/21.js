webpackJsonp([21],{1144:function(e,t,i){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var a=i(63),n=i(479),r=(0,a.fromJS)({loading:!1,error:!1,realTimeLocations:null,onlinePeople:null,onlineDevice:null,alertMessageData:[],isReadCount:0,online:[],offline:["111"]});t.default=function(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:r,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},i=t.type,a=t.payload;if(i===n.RECEIVED_PEOPLE_LOCATION)return e.set("realTimeLocations",a);if(i===n.GET_ONLINE_PEOPLE)return e.set("onlinePeople",a);if(i===n.GET_ONLINE_DEVICE)return e.set("onlineDevice",a);if(i===n.PUSH_ALARM_MESSAGE){var o=e.get("alertMessageData");return e.set("alertMessageData",o.push(a))}if(i===n.PUT_MESSAGE_ISREAD){e.get("alertMessageData").forEach(function(e){e.key===a&&(e.isRead=1)})}if(i===n.PUT_MESSAGE_LASTDATETIME){e.get("alertMessageData").forEach(function(e){e.key===a.id&&(e.lastDateTime=a.lastDateTime)})}if(i===n.PUT_MESSAGE_ISAREA){e.get("alertMessageData").forEach(function(e){e.id===a.id&&e.isArea&&(e.isArea=a.isArea)})}if(i===n.PUT_MESSAGE_ISSHOW){e.get("alertMessageData").forEach(function(e){e.id===a.id&&e.isShow&&(e.isShow=a.isShow)})}if(i===n.OFF_LINE){var s=e.get("offline");return e.set("offline",s.push(a))}if(i===n.ON_LINE){var l=e.get("online");return e.set("online",l.push(a))}if(i===n.UPDATE_ONLINE_DEVICE){var E=e.get("onlineDevice"),f=a.code,u=a.type,_=[];return"off"===u&&(_=E.filter(function(e){return f!==e.personCode})),"on"===u&&_.push(f),e.set("onlineDevice",_)}return e}}});
//# sourceMappingURL=21.js.map