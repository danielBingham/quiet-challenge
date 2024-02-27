
export class Chat {
    timestamp: number
    message: string

    constructor(data: any) {
        this.timestamp = 0
        this.message = ''

        if ( data ) {
            this.fromJSON(data) 
        }
    }

    fromJSON(data: any) {
        this.timestamp = data.timestamp
        this.message = data.message
    }

    toJSON(): any {
        const data: any = {}
        data.timestamp = this.timestamp
        data.message = this.message
        return data
    }
}

