import { LoremIpsum} from 'lorem-ipsum'
import { Chat } from '../model/Chat'

const secondsPerMinute = 60
const secondsPerHour = 60 * secondsPerMinute
const secondsPerDay = 24 * secondsPerHour

const randomInteger = function(min: number, max: number) {
  return Math.floor(Math.random() * max) + min
}

export class ChatGenerator {
  loremIpsum: LoremIpsum

  constructor() {
    this.loremIpsum = new LoremIpsum({
      sentencesPerParagraph: {
        max: 8,
        min: 4
      },
      wordsPerSentence: {
        max: 16,
        min: 4
      }
    })
  }

  generateChatMessages(number: number) {
    const chats: Chat[] = []

    for(let i = 0; i < number; i++) { 
      chats.push(new Chat({ 
        timestamp: Date.now() - randomInteger(0, 365 * secondsPerDay), 
        message: this.loremIpsum.generateSentences(randomInteger(0,7)) 
      }))
    }
    
    chats.sort((a, b) => a.timestamp - b.timestamp)

    return chats 
  }

  generateSimpleMessages(number: number) {
    const chats: Chat[] = []
    for(let i = 0; i < number; i++) {
      chats.push(new Chat({
        timestamp: i,
        message: "" + i
      }))
    }

    chats.sort((a, b) => a.timestamp - b.timestamp)

    return chats

  }
}

