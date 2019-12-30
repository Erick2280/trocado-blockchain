export class Transaction {
    private _sender: string;
    private _receiver: string;
    private _amount: number;

    constructor(sender: string, receiver: string, amount: number) {
        if (Number.isInteger(amount)) {
            this._sender = sender;
            this._receiver = receiver;
            this._amount = amount;
        } else {
            throw new Error ('amountIsNotAnInteger')
        }
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