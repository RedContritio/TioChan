import { CommonMessageEventData, MessageElem, Ret, RetSuccess, Sendable } from "oicq";

export class DefaultSuccess<T> implements RetSuccess<T> {
    retcode: 0 = 0;
    status: "ok" = 'ok';
    data: T;
    error: null = null;

    constructor(v: T) {
        this.data = v;
    }
} 

export class DebugCommonMessageEventData implements CommonMessageEventData {
    post_type: "message" = "message";
    message: MessageElem[] = [];
    raw_message: string;
    message_id: string = "-1";
    user_id: number = -1;
    font: string = "";

    reply(message: Sendable, auto_escape?: boolean): Promise<Ret<{ message_id: string; }>> {
        return new Promise(
            (resolve, reject) => {
                console.log(`Reply: ${message}`);

                resolve(new DefaultSuccess<{ message_id: string }>({ message_id: '-1'}));
            }
        )
    }
    self_id: number = -1;
    time: number = 0;
    sub_type?: string | undefined = undefined;

    constructor(raw_msg: string) {
        this.raw_message = raw_msg;
    }
}

export function make_message(content: string): CommonMessageEventData {
    return new DebugCommonMessageEventData(content);
}