import { GroupMessageEventData, GroupPokeEventData, segment } from "oicq"
import { bot } from "../index"

// hello world
bot.on("message", function (msg) {
	if (msg.raw_message === "hello")
		msg.reply("hello world", true) //改为false则不会引用
})

// 撤回和发送群消息
bot.on("message.group", function (msg: GroupMessageEventData) {
	if (msg.raw_message === "dice") {
		// 撤回这条消息
		this.deleteMsg(msg.message_id);
		// msg.recall();
		// 发送一个骰子
		this.sendGroupMsg(msg.group_id, segment.dice());
		// msg.group.sendMsg(segment.dice())
		// 发送一个戳一戳
		this.sendGroupPoke(msg.group_id, msg.sender.user_id);
		// msg.member.poke()
	}
})

// 接收戳一戳
bot.on("notice.group.poke", function (e: GroupPokeEventData) {
	if (e.target_id === this.uin)
		this.sendGroupMsg(e.group_id, 'dont poke me')
})