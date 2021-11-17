import { CommonMessageEventData, GroupMessageEventData, PrivateMessageEventData, segment } from "oicq";
import { bot } from "../index";
import { master } from "../config";

import { get_group_switch, set_group_switch } from "../utils/group_switch";
import { get_friend_data, set_friend_data } from "../utils/friend_data";
import { report_error } from "../utils/debug_message";

const ls_key = 'repeat_once';

class RepeatData {
    type: 'private' | 'group' = 'private';
    id: number = -1;
};

function repeat_once(msg: PrivateMessageEventData | GroupMessageEventData) {
    try {
    const data: RepeatData = get_friend_data(msg.user_id, ls_key, new RepeatData());
        if(data.id != -1) {
            if(data.type === 'private') {
                bot.sendPrivateMsg(data.id, msg.message);
            } else {
                bot.sendGroupMsg(data.id, msg.message);
            }
            data.id = -1;
        } else if (msg.raw_message === ':repeat'){
            data.type = msg.message_type;
            if(msg.message_type === 'private') {
                data.id = msg.sender.user_id;
            } else {
                data.id = msg.group_id;
            }
        }

        set_friend_data(msg.user_id, ls_key, data);
    } catch (e) {
        report_error(bot, e);
    }
}

// 私聊 echo
bot.on('message.private', function (msg: PrivateMessageEventData) {
    repeat_once(msg);
});

// 群内 echo
bot.on("message.group", function (msg: GroupMessageEventData) {
    if (get_group_switch(msg.group_id, ls_key) === true) {
        repeat_once(msg);
    }
    if (msg.sender.user_id == master) {
        if(msg.raw_message == ':repeat on') {
            set_group_switch(msg.group_id, ls_key, true);
        } else if(msg.raw_message == ':repeat off') {
            set_group_switch(msg.group_id, ls_key, false);
        }
    }
})
