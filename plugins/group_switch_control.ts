import { MessageEventData } from "oicq"
import { master } from "../config";
import { bot } from "../index"

function GSEntry(msg: MessageEventData) {
    // const str = 
    // if(msg.sender.user_id == master) {
        
    // }
}

bot.on('message', function (msg: MessageEventData) {
    GSEntry(msg);
})