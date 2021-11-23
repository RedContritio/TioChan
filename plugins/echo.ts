import { CommonMessageEventData, GroupMessageEventData, PrivateMessageEventData, segment } from "oicq";
import { bot } from "../index";
import { master } from "../config";
import { get_group_switch, set_group_switch } from "../utils/group_switch";
import { get_friend_data, set_friend_data } from "../utils/friend_data";

const ls_key = 'group_echo';
const COOLDOWN: number = 1000; // ms

const echo_match = (s: string) => {
    return s.slice(5);
}

function echo(msg: CommonMessageEventData) {
    const text = msg.raw_message;
    const prev: number = get_friend_data(msg.user_id, ls_key, 0);
    // Timestamp / ms
    const cur: number = Date.now();
    if (text.startsWith("echo ")) {
        if(cur - prev >= COOLDOWN) {
            msg.reply(text.slice(5));
            set_friend_data(msg.user_id, ls_key, cur);
        }
    }
}

// 私聊 echo
bot.on('message.private', function (msg: PrivateMessageEventData) {
    echo(msg);
});

// 群内 echo
bot.on("message.group", function (msg: GroupMessageEventData) {
    if (get_group_switch(msg.group_id, ls_key) === true) {
        echo(msg);
    }
    if (msg.sender.user_id == master) {
        if(msg.raw_message == ':echo on') {
            set_group_switch(msg.group_id, ls_key, true);
        } else if(msg.raw_message == ':echo off') {
            set_group_switch(msg.group_id, ls_key, false);
        }
    }
})
