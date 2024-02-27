import WebSocket from 'ws'

import { Backend } from '../model/Backend'
import { Client } from '../model/Client'
import { 
  parseMessage,
  ConnectionOpen,
  OpenChannelMessage,
  ChannelOpenMessage,
  LoadPageMessage,
  PageLoadedMessage,
  SendChatMessage,
  RecieveChatMessage

} from '../model/Message'

const PAGE_LENGTH = 25

/**
 * A dispatcher to handle recieving signals and sending responses.
 */
export class Dispatcher {
  backend: Backend 

  /**
   * Construct the dispatcher.  It needs access to our backend and the server
   * socket.
   *
   * @param {Backend} backend The backend.
   */
  constructor(backend: Backend) {
    this.backend = backend
  }

  /**
   * Connect a new socket.  Creates a client for it and adds it to the
   * appropriate channel in the backend.  Then it sends the `ConnectionOpen`
   * message with initial channel metadata.
   *
   * @param {WebSocket} socket The web socket or a mock web socket.
   *
   * TODO TECH DEBT: We're accepting any to allow a mock websocket here because
   * I couldn't get typescript to play nice with jest's mocking of the ws
   * library under the time constraints.
   *
   * @return {Client}
   */
  connect(socket: WebSocket | any): Client {
    // TECHDEBT We need somewhere to put new clients and we don't want to make
    // assumptions about what channels we have.  So we're going to always make
    // sure we have a 'general' channel.
    //
    // The "default channel" should probably be configurable.
    const id = this.backend.clients['general'].length
    const client = new Client(id, socket)
    client.channelName = 'general'
    this.backend.clients['general'].push(client)

    const message = new ConnectionOpen()

    for(const [name, channel] of Object.entries(this.backend.channels)) {
      message.channelsMeta[name] = channel.meta
    }

    client.socket.send(JSON.stringify(message))
    return client
  }

  /**
   * Handle a message from one of the clients.  This parses the message,
   * updates the backend accordingly and dispatches a response.
   *
   * @param {Client} client The client who's message we're parsing. 
   * @param {string} rawData The raw data from the socket, converted to string.
   *
   * @return {void}
   */
  handleMessage(client: Client, rawData: string): void {
    const message = parseMessage(JSON.parse(rawData))

    // OpenChannelMessage - The client wants to open a new channel.
    if ( message instanceof OpenChannelMessage ) {
      const name = message.channelName
      
      const response = new ChannelOpenMessage()
      response.channelName = name

      const channel = this.backend.channels[name]

      let lastIndex = channel.chats.length
      let index = lastIndex - PAGE_LENGTH

      response.chats = channel.chats.slice(index, lastIndex)
      response.index = index

      // TODO TECHDEBT Remove the client from their current channel.  This is a naive way to
      // do this and will start to fall down in very large channels.
      this.backend.clients[client.channelName] = this.backend.clients[client.channelName].filter((c) => c.id !== client.id)

      // Update the client so we can use this to decide whether to send
      // messages to the frontend.
      client.channelName = name
      client.index = index

      this.backend.clients[client.channelName].push(client)

      client.socket.send(JSON.stringify(response))
    } 

    // LoadPageMessage - The client has requested a new page.
    else if ( message instanceof LoadPageMessage ) {
      const name = message.channelName

      const response = new PageLoadedMessage()

      const channel = this.backend.channels[name]


      let lastIndex = message.index 
      let index = lastIndex - PAGE_LENGTH

      response.chats = channel.chats.slice(index, lastIndex)
      response.index = index

      // Update the client so we can use this to decide whether to send
      // messages to the frontend.
      client.index = index

      client.socket.send(JSON.stringify(response))
    } 

    // SendChatMessage - The client has sent a chat message to their current
    // channel.
    else if ( message instanceof SendChatMessage ) {
      const name = message.channelName
      const channel = this.backend.channels[name]

      if ( ! message.chat ) {
        throw new Error('Message missing chat content!')
      }

      // We need to construct the recieve set before we insert the message into
      // its proper place.  Inserting it is going to change indexes and we want
      // to make sure we send the message based on the current indexes.  So
      // build the recieve set based on who should already have the message
      // loaded.
      //
      // Clients who should already have the message loaded are those who have
      // already scrolled up above it.  So the timestamp for the chat their
      // index is at should be lower than the timestamp of the message we're
      // sending.
      const recieveSet: Client[] = []
      const incrementSet: Client[] = []
      for(const c of this.backend.clients[name]) {

        if ( c.id != client.id && channel.chats[c.index].timestamp < message.chat.timestamp ) {
          recieveSet.push(c)
        } else {
          incrementSet.push(c)          
        }
      }

      // TODO The recieveSet should get the message.  But the total set
      // probably still needs updated channel metadata.  However, this presents
      // serious performance challenge since we basically need to send out
      // notifications to every client.  This is something we'd ideally avoid.

      // Add the chat to the channel.
      channel.addChat(message.chat)

      // TODO We need to send updated channel meta data with this.
      const response = new RecieveChatMessage() 
      response.channelName = name
      response.chat = message.chat

      // For the receive set, they have scrolled above the message, so we need
      // to send them the message so that their frontend can insert it in the
      // proper place in their scroll.
      for(const c of recieveSet) {
        c.socket.send(JSON.stringify(response))
      }

      // For the increment set, they haven't scrolled above the message.  So we
      // need to increment our copy of their index.  
      for(const c of incrementSet) {
        c.index += 1
        // TODO TECHDEBT We need to send a message to the front end to sync the index on
        // the frontend as well. Ran out of time to execute this.
      }
    } 

    // ERROR! Unhandled message type.
    else {
      console.error(`Error! Unhandled message type ${message.type}.`)
    }
  }
}
