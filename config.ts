import { ConfBot } from "oicq";

export const uin: number = 2829619622;

export const master: number = 591369735;

export const login_options: ConfBot = {
    platform: 3, //登陆类型 1手机 2平板 3手表(不支持部分群事件)
    // log_level: "info", //日志级别，有trace,debug,info,warn,error,fatal,off
    log_level: "warn", //日志级别，有trace,debug,info,warn,error,fatal,off
    kickoff: false, //被挤下线是否在3秒后反挤对方
    ignore_self: true, //群聊是否无视自己的发言
}