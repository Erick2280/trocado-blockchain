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
    
    constructor (index: number, timestamp: string, transactions: Transaction[], previousHash: string, proof: number) {
        this._index = index;
        this._timestamp = timestamp;
        this._transactions = transactions;
        this._previousHash = previousHash;
        this._proof = proof;
        this._sealed = false;
    }
    
    public seal() {
        if (this._sealed) {
            throw new Error ('blockIsAlreadySealed')
        } else {
            this._hash = this.generateHash();
            this._sealed = true;
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
        if (!this._sealed) {
            throw new Error ('blockIsNotSealed')
        } else if (!this.checkSeal()) {
            throw new Error ('blockSealDoesNotMatch')
        } else {
            return this._hash;
        }
    }

    public get sealed(): boolean {
        return this._sealed;
    }
    
}