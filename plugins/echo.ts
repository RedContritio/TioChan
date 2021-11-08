import { CommonMessageEventData, GroupMessageEventData, PrivateMessageEventData, segment } from "oicq";
import { bot } from "../index";
import { master } from "../config";
import { get_group_switch, set_group_switch } from "../utils/group_switch";

const ls_key = 'group_echo';

const echo_match = (s: string) => {
    return s.slice(5);
}

function echo(msg: CommonMessageEventData) {
    const text = msg.raw_message;
    if (text.startsWith("echo "))
        msg.reply(text.slice(5));
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
