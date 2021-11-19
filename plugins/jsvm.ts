import { CommonMessageEventData, GroupMessageEventData, PrivateMessageEventData, segment } from "oicq";
import { bot } from "../index";
import { master } from "../config";

import { NodeVM } from 'vm2';
import { get_group_switch, set_group_switch } from "../utils/group_switch";
import { report_error } from "../utils/debug_message";

const ls_key = 'vm_js';

async function jsvm(code: string, print: (obj: string) => void, ret: (v: any) => void): Promise<void> {
    return new Promise<void>(
        (resolve, reject) => {
            const vm = new NodeVM({
                console: "redirect",
                timeout: 1000,
                require: {
                    external: true
                }
            });
        
            vm.on('console.log', (data) => {
                print(`${data}`);
            });
        
	    // console.log(code);
            const retv = vm.run(code);
        
            ret(retv);
            resolve();
        }
    )
}

function jsvmEntry(msg: PrivateMessageEventData | GroupMessageEventData) {
    try {
        // console.log(msg);
        const content: string = msg.raw_message;
        const lines: string[] = content.split(/\r|\n/);
        let output: string = "";
        let retv: string = "";
        if(lines[0] === ':vm js') {
            const code = lines.slice(1).join('\n');
	        // console.log(code);
            jsvm(code,
                (s: string) => {
                    output = `${output}\n${s}`;
                },
                (v: any) => {
                    retv = `\n${v}`;
                }).then(() => {
		// msg.reply(`输出：${output}\n返回值：${retv}`);
                    msg.reply(`输出：${output}`);
                })
        }
    } catch (e) {
        msg.reply(`异常：\n${e}`);
        report_error(bot, e);
    }
}

// 私聊 echo
bot.on('message.private', function (msg: PrivateMessageEventData) {
    jsvmEntry(msg);
});

// 群内 echo
bot.on("message.group", function (msg: GroupMessageEventData) {
    if (get_group_switch(msg.group_id, ls_key) === true) {
        jsvmEntry(msg);
    }
    if (msg.sender.user_id == master) {
        if(msg.raw_message == ':vm js on') {
            set_group_switch(msg.group_id, ls_key, true);
        } else if(msg.raw_message == ':vm js off') {
            set_group_switch(msg.group_id, ls_key, false);
        }
    }
})
