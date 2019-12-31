import { isUuid } from 'uuidv4';

export class Transaction {
    private _sender: string;
    private _receiver: string;
    private _amount: number;

    constructor(sender: string, receiver: string, amount: number) {
        if (!Number.isInteger(amount))
            throw new Error ('amountIsNotAnInteger')
        if (sender !== 'mined' && !isUuid(sender))
            throw new Error ('senderIsNotAValidUUID')
        if (!isUuid(receiver))
            throw new Error ('receiverIsNotAValidUUID')

        this._sender = sender;
        this._receiver = receiver;
        this._amount = amount;
    }

    public get sender() {
        return this._sender;
    }

    public get receiver() {
        return this._receiver;
    }

    public get amount() {
        return this._amount;
    }

}