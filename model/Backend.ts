import { Channel } from './Channel'
import { Client } from './Client'
import { Chat } from './Chat'

/**
 * The backend wrapping our data. TECHDEBT Replace me with a real backend.
 */
export class Backend { 
    /** The channels we have available. **/
    channels:  { [name: string]: Channel }

    /** A map of clients and the channels they are currently watching. **/
    clients: { [channelName: string]: Client[] }
 
    constructor() {
        this.channels = {
            'general': new Channel('general')
        } 
        this.clients = {
            'general': []
        } 
    }

    /**
     * Create a new channel, optionally initialize it with a list of chats.
     */
    createChannel(name: string, chats?: Chat[]) {
        this.channels[name] = new Channel(name, chats)
        this.clients[name] = []
    }
}
