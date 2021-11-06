import { segment } from "oicq";
import { bot } from "../index";
import { master } from "../config";
import { LocalStorage } from "../utils/localstorage";

const ls_key = 'group_echo';
const group_echo: { [key: number] : boolean } = LocalStorage.get(ls_key);

const echo_match = (s: string) => {
    return s.slice(5);
}

// 私聊 echo
bot.on("message", function (msg) {
    try {
        if (msg.message_type == "group") {
            if (msg.group_id in group_echo && group_echo[msg.group_id] === true) {
                if (msg.raw_message.startsWith("echo "))
                    msg.reply(echo_match(msg.raw_message));
            }
            if (msg.sender.user_id == master) {
                if (msg.raw_message.startsWith('@echo ')) {
                    const option = msg.raw_message.slice(6);
                    if (option == 'on' || option == 'off') {
                        if (option == 'on') {
                            group_echo[msg.group_id] = true;
                        }
                        if (option == 'off') {
                            group_echo[msg.group_id] = false;
                        }
                        console.log('更改了群<', msg.group_name, '>的echo状态为：', group_echo[msg.group_id]);
                        LocalStorage.set(ls_key, group_echo);
                    }
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
