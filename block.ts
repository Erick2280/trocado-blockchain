import { Transaction } from './transaction'

import shajs from 'sha.js'

/**
 * Classe responsável pelos blocos da Blockchain.
 */
export class Block {
    /** Índice do bloco */
    private _index: number;

    /** Data e hora da criação do bloco */
    private _timestamp: string;
    
    /** Transações contidas no bloco */
    private _transactions: Transaction[];
    
    /** Hash SHA-256 referente ao bloco anterior */
    private _previousHash: string;

    /** Hash SHA-256 referente ao bloco atual */
    private _hash: string;

    /** Indica se o bloco foi "selado" (sua hash já foi calculada) */
    private _sealed: boolean;

    /** Prova de trabalho do bloco */
    private _proof: number;
    
    /**
     * Cria uma instância da classe Block.
     * @param [index] Indíce do bloco (padrão: 0)
     * @param [timestamp] Data e hora da criação do bloco (padrão: hora atual)
     * @param [transactions] Transações contidas no bloco (padrão: vazio)
     * @param [previousHash] Hash SHA-256 referente ao bloco anterior (padrão: '1') 
     * @param [proof] Prova de trabalho do bloco (padrão: 100)
     */
    constructor (index: number = 0, timestamp: string = new Date().toISOString(), transactions: Transaction[] = [], previousHash: string = '1', proof: number = 100) {
        this._index = index;
        this._timestamp = timestamp;
        this._transactions = transactions;
        this._previousHash = previousHash;
        this._proof = proof;
        this._sealed = false;
        this._hash = '';
    }
    
    /**
     * "Sela" o bloco: Armazena a hash SHA-256 referente ao bloco atual e o marca como "selado".
     */
    public seal() {
        if (this._sealed)
                throw new Error ('blockIsAlreadySealed');
        if (
            this._index == null ||
            this._timestamp == null ||
            this._transactions == null ||
            this._previousHash == null ||
            this._proof == null)
                throw new Error ('blockHasNullProperty');
        
        this._hash = this.generateHash();
        this._sealed = true;
        
    }

    /**
     * Copia dados de um objeto `block` para o bloco atual. Útil para converter os dados serializados recebidos em instâncias da classe Block.
     * @param block Objeto a ser copiado
     */
    public fromObject(block) {
        const properties = ['_index', '_timestamp', '_transactions', '_previousHash', '_hash', '_sealed', '_proof']
        for (let property of properties) {
            if (!block.hasOwnProperty(property))
                throw new Error ('blockPropertyMissingOnCopy')
            if (typeof block[property] !== typeof this[property])
                throw new Error ('blockPropertyFailedOnTypeCheckingOnCopy')
        }

        this._index = block._index;
        this._timestamp = block._timestamp;
        this._previousHash = block._previousHash;
        this._proof = block._proof;
        this._sealed = block._sealed;
        this._hash = block._hash;

        for (let transaction of block._transactions) {
            this._transactions.push(new Transaction(transaction._sender, transaction._receiver, transaction._amount))
        }
    }
    
    /**
     * Verifica se o bloco está íntegro a partir da sua hash SHA-256.
     * @returns `true` se o bloco estiver íntegro
     */
    public checkSeal(): boolean {
        return this._hash == this.generateHash();
    }
    
    /**
     * Calcula a hash SHA-256 do bloco.
     * @returns hash 
     */
    private generateHash(): string {
        let hash: string;
        let data = {
            index: this._index,
            timestamp: this._timestamp,
            transactions: this._transactions,
            previousHash: this._previousHash,
            proof: this._proof
        }
        
        hash = shajs('sha256').update(JSON.stringify(data, Object.keys(data).sort())).digest('hex')
        return hash;
    }
    
    public get index() {
        return this._index;
    }

    public get timestamp(): string {
        return this._timestamp;
    }

    public get transactions(): Transaction[] {
        return this._transactions;
    }
    
    public get previousHash(): string {
        return this._previousHash;
    }

    public get proof(): number {
        return this._proof;
    }

    public get hash(): string {
        // Verifica se o bloco está selado e íntegro antes de retornar a hash SHA-256.
        if (!this._sealed)
            throw new Error ('blockIsNotSealed')
        if (!this.checkSeal())
            throw new Error ('blockSealDoesNotMatch')
        
        return this._hash;
    }

    public get sealed(): boolean {
        return this._sealed;
    }
    
}