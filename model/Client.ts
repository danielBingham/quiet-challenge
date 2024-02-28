import WebSocket from 'ws'


export class Client {
    static MAX_ID = 0

    /** A simple id we're going to assign to each client. */
    id: number

    /** 
     * The WebSocket the client is connected through.  (TECHDEBT also accepting
     * any to allow a mock WebSocket because I couldn't get jest to play nice with ws and
     * typescript with in the time constraints. ) 
     ***/
    socket: WebSocket  | any 

    /** The channel they are currently viewing. **/
    channelName: string

    /** The point in that channel they have loaded to. **/
    index: number

    constructor(socket: WebSocket | any ) {
        // TECHDEBT We probably want a way to reuse ids when clients close.  Or
        // we should just use UUID.
        this.id = Client.MAX_ID 
        Client.MAX_ID += 1 

        this.socket = socket

        this.channelName = ''
        this.index = 0
    }
}
