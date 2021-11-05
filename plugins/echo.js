"use strict"
const { segment } = require("oicq")
const { bot } = require("../index")

// 私聊 echo
bot.on("message", function (msg) {
    if(msg.message_type == "private") {
        if(msg.raw_message.startsWith("echo "))
            msg.reply(msg.raw_message.slice(5));
    }
})
