import { segment } from "oicq";
import { bot } from "../index";
import { master } from "../config";
import { get_group_switch, set_group_switch } from "../utils/group_switch";

const ls_key = 'group_echo';

const echo_match = (s: string) => {
    return s.slice(5);
}

// 私聊 echo
bot.on("message", function (msg) {
    try {
        if (msg.message_type == "group") {
            if (get_group_switch(msg.group_id, ls_key) === true) {
                if (msg.raw_message.startsWith("echo "))
                    msg.reply(echo_match(msg.raw_message));
            }
            if (msg.sender.user_id == master) {
                if(msg.raw_message == '@echo on') {
                    set_group_switch(msg.group_id, ls_key, true);
                } else if(msg.raw_message == '@echo off') {
                    set_group_switch(msg.group_id, ls_key, false);
                }
            }
        }
        if (msg.message_type == "private") {
            if (msg.raw_message.startsWith("echo "))
                msg.reply(echo_match(msg.raw_message));
        }
    } catch (error) {
        console.log(error);
    }

    // LocalStorage.set('test', {a: 1});
})
