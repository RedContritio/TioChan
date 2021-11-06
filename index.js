"use strict"
const { createClient } = require("oicq")
const { uin } = require("./config");

const bot = createClient(uin)

bot
	.on("system.login.qrcode", function (e) {
		this.logger.mark("扫码后按Enter完成登录")
		process.stdin.once("data", () => {
			this.login()
		})
	})
	.login()

exports.bot = bot

// template plugins
require("./plugins/hello") //hello world
// require("./plugins/image") //发送图文和表情
require("./plugins/echo") //发送图文和表情
require("./plugins/request") //加群和好友
require("./plugins/online") //监听上线事件

process.on("unhandledRejection", (reason, promise) => {
	console.log('Unhandled Rejection at:', promise, 'reason:', reason)
})