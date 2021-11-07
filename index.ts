import { createClient } from "oicq";
import { uin } from "./config";

export const bot = createClient(uin)

bot
	.on("system.login.qrcode", function (e) {
		this.logger.mark("扫码后按Enter完成登录")
		process.stdin.once("data", () => {
			this.login()
		})
	})
	.login()

exports.bot = bot

import './plugins/hello';
import './plugins/echo';
import './plugins/request';
import './plugins/online';

process.on("unhandledRejection", (reason, promise) => {
	console.log('Unhandled Rejection at:', promise, 'reason:', reason)
})