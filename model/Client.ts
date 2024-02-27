import WebSocket from 'ws'


export class Client {
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

    constructor(id: number, socket: WebSocket | any ) {
        this.id = id
        this.socket = socket

        this.channelName = ''
        this.index = 0
    }
}
