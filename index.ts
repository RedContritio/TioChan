import { createClient } from "oicq";
import { uin, login_options } from "./config";
import { get_password_md5 } from "./utils/password";

export const bot = createClient(uin, login_options)
// export const bot = createClient(uin)
// const use_pwd = false;
const use_pwd = true;

const pwd_md5 = get_password_md5('login');

if (use_pwd && pwd_md5 !== null) {
 	bot.login(pwd_md5);
} else {
	bot.on("system.login.qrcode", function (e) {
		this.logger.mark("扫码后按Enter完成登录")
		process.stdin.once("data", () => {
			this.login();
		})
	}).login();
}

import './plugins/hello';
import './plugins/repeat';
import './plugins/echo';
import './plugins/request';
import './plugins/online';
import './plugins/sky';
import './plugins/poke';
import './plugins/jsvm';
import { report_error } from "./utils/debug_message";

process.on("unhandledRejection", (reason, promise) => {
	console.log('Unhandled Rejection at:', promise, 'reason:', reason);
	report_error(bot, reason);
});
