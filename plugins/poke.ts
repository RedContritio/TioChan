import { CommonMessageEventData, FriendPokeEventData, GroupPokeEventData, PrivateMessageEventData, segment } from "oicq";
import { bot } from "../index";
import { master } from "../config";
import { get_friend_data, set_friend_data } from "../utils/friend_data";

const ls_key = 'poke';

function poked(sender_uin: number, send: (msg: string) => void, poke: () => void): void {
	const state: number = get_friend_data(sender_uin, ls_key, 0);
	// console.log(sender_uin, state);

	if (Math.random() < .3 || state <= 5)
		send('别戳了别戳了');
	else if (Math.random() < .2 || state <= 15)
		send('别戳我了好不好');
	else if (Math.random() < .2 || state <= 30) {
		if (Math.random() < .2) poke();
		send('真的不兴戳我的！')
	}
	else if (Math.random() < .2 || state <= 50) {
		if (Math.random() < .5) poke();
		send('怎么又戳我？！！')
	} else {
		poke();
	}

	set_friend_data(sender_uin, ls_key, state + 1);
}

bot.on('notice.friend.poke', function (e: FriendPokeEventData) {
	const send = (msg: string) => bot.sendPrivateMsg(e.operator_id, msg);
	const poke = () => bot.sendPrivateMsg(e.operator_id, segment.poke(0));
	if (e.target_id === this.uin)
		poked(e.operator_id, send, poke);
});

// 接收戳一戳
bot.on("notice.group.poke", function (e: GroupPokeEventData) {
	const send = (msg: string) => bot.sendGroupMsg(e.group_id, msg);
	const poke = () => bot.sendGroupPoke(e.group_id, e.operator_id);
	if (e.target_id === this.uin)
		poked(e.operator_id, send, poke);
});