import { createClient } from "oicq";
import { uin, login_options } from "./config";
import { get_password_md5 } from "./utils/password";

// export const bot = createClient(uin, login_options)
export const bot = createClient(uin)

// const pwd_md5 = get_password_md5('login');

// if (pwd_md5 !== null) {
// 	bot.login(pwd_md5);
// }

// if (pwd_md5 === null || !bot.isOnline()) {
	bot.on("system.login.qrcode", function (e) {
		this.logger.mark("扫码后按Enter完成登录")
		process.stdin.once("data", () => {
			this.login();
		})
	}).login();
// }

import './plugins/hello';
import './plugins/echo';
import './plugins/request';
import './plugins/online';
import './plugins/sky';

process.on("unhandledRejection", (reason, promise) => {
	console.log('Unhandled Rejection at:', promise, 'reason:', reason)
});