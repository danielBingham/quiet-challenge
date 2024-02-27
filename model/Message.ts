import { Chat } from './Chat'
import { ChannelMeta } from './Channel'

/**
 * The message types that we can send and need to handle.
 */
export enum MessageType { 
    // A new connection has been opened.
    ConnectionOpen = 'connection-open',

    // A client has requested a new channel.
    OpenChannel = 'open-channel',
    // A response indicating the channel was opened successfully.
    ChannelOpen = 'channel-open',

    // A client is requesting the next page.
    LoadPage = 'load-page',
    // A response with the requested page.
    PageLoaded = 'page-loaded',

    // A client has sent a chat.
    SendChat = 'send-chat',
    // A client is recieving a chat sent by another client.
    RecieveChat = 'recieve-chat'
}

/**
 * A base message class. All others extend it. Not intended to be sent on its
 * own.
 */
export class Message {
    type: MessageType 

    constructor(type: MessageType, data: any) {
        this.type = type 

        if ( data ) {
            this.fromJSON(data)
        }
    }

    fromJSON(data: any) {
        this.type = data.type
    }

    toJSON(): any {
        const data: any = {}
        data.type = this.type
        return data
    }
}

/**
 * A base announcement that a connection has been opened.
 */
export class ConnectionOpen extends Message {
    /** The current channel metadata **/
    channelsMeta: { [name: string]: ChannelMeta } 

    constructor(data?: any) {
        super(MessageType.ConnectionOpen, data)

        this.channelsMeta = {} 

        if ( data ) {
            this.fromJSON(data)
        }
    }

    fromJSON(data: any) {
        for(const [name, meta] of Object.entries(data.channelsMeta)) {
            this.channelsMeta[name] = new ChannelMeta(meta)
        }
    }

    toJSON() {
        const data = super.toJSON()
        data.channelsMeta = {}
        for(const [name, meta] of Object.entries(this.channelsMeta)) {
            data.channelsMeta[name] = meta.toJSON()
        }
        return data
    }
}

/**
 * A request from client to open a channel.
 */
export class OpenChannelMessage extends Message {
    /** The channel the client is requesting be opened. **/
    channelName: string

    constructor(data?: any) {
        super(MessageType.OpenChannel, data)

        this.channelName = ''

        if ( data ) {
            this.fromJSON(data)
        }
    }

    fromJSON(data: any) {
        this.channelName = data.channelName
    }

    toJSON(): any {
        const data = super.toJSON()
        data.channelName = this.channelName
        return data
    }
}

/**
 * A response to a client with the results of opening a channel.
 */
export class ChannelOpenMessage extends Message {
    /** The name of the channel that has been opened. **/
    channelName: string

    /** The list of chats contained in the channel's first page. **/
    chats: Chat[] 

    /** The index the client will be at having loaded the first page of the channel's chats. **/
    index: number

    constructor(data?: any) {
        super(MessageType.ChannelOpen, data)

        this.index = 0
        this.channelName = ''
        this.chats = []

        if ( data ) {
            this.fromJSON(data)
        }
    }

    fromJSON(data: any) {
        this.index = data.index
        this.channelName = data.channelName

        this.chats = []
        for(const chat of data.messages) {
            this.chats.push(new Chat(chat))
        }
    }

    toJSON(): any {
        const data = super.toJSON()
        data.index = this.index
        data.channelName = this.channelName

        data.chats = []
        for(const chat of this.chats) {
            data.chats.push(chat.toJSON())
        }
        return data
    }
}

/**
 * A message sent from a client to a channel.
 */
export class SendChatMessage extends Message {
    /** The name of the channel that a message is being sent to. **/
    channelName: string

    /** The chat that is being sent. **/
    chat: Chat | null

    constructor(data?: any) {
        super(MessageType.SendChat, data)

        this.channelName = ''
        this.chat = null 

        if ( data ) {
            this.fromJSON(data)
        }
    }

    fromJSON(data: any) {
        this.channelName = data.channelName
        this.chat = new Chat(data.chat)
    }

    toJSON(): any {
        const data = super.toJSON()
        data.channelName = this.channelName
        data.chat = ( this.chat ? this.chat.toJSON() : null)
        return data
    }
}

/**
 * A message sent from a channel to a client. 
 */
export class RecieveChatMessage extends Message {
    /** The name of the channel that this message is being sent from. **/
    channelName: string

    /** The chat message. **/
    chat: Chat | null

    constructor(data?: any) {
        super(MessageType.RecieveChat, data)

        this.channelName = ''
        this.chat = null 

        if ( data ) {
            this.fromJSON(data)
        }
    }

    fromJSON(data: any) {
        this.channelName = data.channelName
        this.chat = new Chat(data.chat)
    }

    toJSON(): any {
        const data = super.toJSON()
        data.channelName = this.channelName
        data.chat = ( this.chat ? this.chat.toJSON() : null)
        return data
    }
}

/**
 * A request from a client to load a page.
 */
export class LoadPageMessage extends Message {
    /** The channel we want to load the next page for. **/
    channelName: string

    /** The clients current place in the chat list, respresents the spot they
     * have scrolled up to before we send them the next page. **/
    index: number

    constructor(data?: any) {
        super(MessageType.LoadPage, data)

        this.channelName = ''
        this.index = 0

        if ( data ) {
            this.fromJSON(data)
        }
    }

    fromJSON(data: any) {
        this.channelName = data.channelName
        this.index = data.index
    }

    toJSON(): any {
        const data = super.toJSON()
        data.channelName = this.channelName
        data.index = this.index
        return data
    }
}

/**
 * A response to a client with the loaded page.
 */
export class PageLoadedMessage extends Message {

    /** The next pages worth of chats. **/
    chats: Chat[]

    /** 
     * The client's place in this channel's chat list. Represents the spot to
    * which they have scrolled up to now that we are sending them the next
    * page. This is where they are having loaded that page.
    ***/
    index: number

    constructor(data?: any) {
        super(MessageType.PageLoaded, data)

        this.chats = [] 
        this.index = 0

        if ( data ) {
            this.fromJSON(data)
        }
    }

    fromJSON(data: any) {
        this.index = data.index

        this.chats = []
        for(const chat in data.chats) {
            this.chats.push(new Chat(chat))
        }
    }

    toJSON(): any {
        const data = super.toJSON()
        data.index = this.index
        data.chats = []
        for(const chat of this.chats) {
            data.chats.push(chat.toJSON())
        }
        return data
    }
}

/**
 * Parse a message from decoded JSON data.
 *
 * @param {any} data The raw json data of the message.  Should be
 * deserializable by one of the Message classes' `fromJSON()` messages.
 *
 * @return {Message} The parsed message, a subclass of Message.
 */
export function parseMessage(data: any): Message {
    if ( data.type == MessageType.ConnectionOpen ) {
        return new ConnectionOpen(data)
    } else if ( data.type == MessageType.OpenChannel ) {
        return new OpenChannelMessage(data)
    } else if ( data.type == MessageType.ChannelOpen ) {
        return new ChannelOpenMessage(data)
    } else if ( data.type == MessageType.SendChat ) {
        return new SendChatMessage(data)
    } else if ( data.type == MessageType.RecieveChat ) {
        return new RecieveChatMessage(data)
    } else if ( data.type == MessageType.LoadPage ) {
        return new LoadPageMessage(data)
    } else if ( data.type == MessageType.PageLoaded) {
        return new PageLoadedMessage(data)
    } else {
        throw new Error(`Unrecognized message type "${data.type}".`)
    }
}
