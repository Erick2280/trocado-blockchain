import { Transaction } from './transaction'

import shajs from 'sha.js'

export class Block {
    private _index: number;
    private _timestamp: string;
    private _transactions: Transaction[];
    private _previousHash: string;
    private _hash: string;
    private _sealed: boolean;
    private _proof: number;
    
    constructor (index: number = 0, timestamp: string = new Date().toISOString(), transactions: Transaction[] = [], previousHash: string = '1', proof: number = 100) {
        this._index = index;
        this._timestamp = timestamp;
        this._transactions = transactions;
        this._previousHash = previousHash;
        this._proof = proof;
        this._sealed = false;
        this._hash = '';
    }
    
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
    
    public checkSeal(): boolean {
        return this._hash == this.generateHash();
    }
    
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