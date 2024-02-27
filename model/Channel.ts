import { Chat } from './Chat'

/**
 * Metadata about a channel.
 *
 * Serializable so that we can send it to clients in a message.
 */
export class ChannelMeta {

    /** Total chats in this channel. **/
    totalChats: number

    constructor(data: any) {
        this.totalChats = 0

        if ( data ) {
            this.fromJSON(data)
        }
    }

    fromJSON(data: any) {
        this.totalChats = data.totalChats
    }

    toJSON() {
        const data: any = {}
        data.totalChats = this.totalChats
        return data
    }
}

/**
 * A channel's complete data.  
 *
 * Intentionally NOT serializable.  Not intended to be sent wholesale.
 */
export class Channel {
    /** The name of this channel. **/
    name: string

    /** The list of chats send in the channel.  Newer chats are added to the
    * end of the array, so chat[0] is the beginning of the channel. **/
    chats: Chat[]

    /** The metadata for this channel. **/
    meta: ChannelMeta

    constructor(name: string, chats?: Chat[]) {
        this.name = name
        this.chats = []

        if ( chats ) {
            this.chats = chats 
        }

        this.meta = new ChannelMeta({ totalChats: this.chats.length })
    }

    /**
     * Add a chat to the channel.  Update the metadata.
     *
     * @param {Chat} chat The chat we'd like to add.
     *
     * @return {void}
     */
    addChat(chat: Chat): void {
      // Put the chat on the end of the list.  We'll sort it in after we add
      // it.
      this.chats.push(chat)

      // Insert the message in order with its timestamp.  Don't assume it's the
      // most recent message.
      for(let index = this.chats.length-1; index > 0; index--) {
        if ( this.chats[index-1].timestamp > this.chats[index].timestamp ) {
          let chat = this.chats[index-1]
          this.chats[index-1] = this.chats[index]
          this.chats[index] = chat
        } else {
          // If we're here, it means we've found the spot in the list where it
          // belongs.
          break
        }
      }

      this.meta.totalChats = this.chats.length
    }
}

