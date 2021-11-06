"use strict"
import { FriendAddEventData, GroupInviteEventData } from "oicq"
import { bot } from "../index"

// 同意好友申请
bot.on("request.friend.add", (e: FriendAddEventData) => bot.setFriendAddRequest(e.flag, true));

// 同意群邀请
bot.on("request.group.invite", (e: GroupInviteEventData) => bot.setGroupAddRequest(e.flag, true));

// 同意加群申请，拒绝`e.approve(false)`
// bot.on("request.group.add", e => e.approve())