import { isUuid } from 'uuidv4';

/**
 * Classe responsável pelas transações na blockchain.
 */
export class Transaction {
    /** Remetente da transação */
    private _sender: string;

    /** Destinatário da transação */
    private _receiver: string;

    /** Quantidade de trocados transferidos */
    private _amount: number;

    /**
     * Cria uma nova transação.
     * @param sender Remetente da transação
     * @param receiver Destinatário da transação
     * @param amount Quantidade de trocados transferidos
     */
    constructor(sender: string, receiver: string, amount: number) {
        // Verifica se a quantidade de trocados é um inteiro
        if (!Number.isInteger(amount))
            throw new Error ('amountIsNotAnInteger')

        // Verifica se o identificador do remetente é valido caso o valor não tenha sido minerado
        if (sender !== 'mined' && !isUuid(sender))
            throw new Error ('senderIsNotAValidUUID')

        // Verifica se o identificador do destinatário é válido
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