import { Block } from './block';
import { Transaction } from './transaction';

import shajs from 'sha.js'

export class Blockchain {
    private _chain: Block[];
    private _pendingTransactions: Transaction[];
    private _peers: string[]; 

    constructor() {
        this._chain = [];
        this._pendingTransactions = [];
        this._peers = [];
        
        this.newBlock(100);
    }
    
    public addPeer(peer: string) {
        this._peers.push(peer);
    }

    public get peers() {
        return this._peers;
    }
    
    public testChainValidity(): boolean {

        // VERIFICAÇÕES NO BLOCO GENESIS

        // o índice deve ser zero
        if (this._chain[0].index !== 0)
            return false
        
        // hash precisa estar correto
        if (!this._chain[0].checkSeal())
            return false

        // o bloco deve ter zero transações
        if (this._chain[0].transactions.length !== 0)
            return false
        
        // VERIFICAÇÕES NOS BLOCOS SUBSEQUENTES

        for (let i = 1; i < this._chain.length; ++i) {
            // o campo da hash anterior no bloco atual deve ser igual ao
            // campo hash no bloco anterior
            if (this._chain[i].previousHash !== this._chain[i - 1].hash)
                return false
            
            // o campo índice do bloco deve conferir com seu índice
            if (this._chain[i].index !== i)
                return false

            // hash precisa estar correto
            if (!this._chain[i].checkSeal())
                return false

            // prova de trabalho deve ser válida
            if (!this.checkProofOfWork(this._chain[i - 1].proof, this._chain[i].proof, this._chain[i - 1].hash))
                return false
        }

        return true;
    }

    // TO-DO: Resolvedor de conflitos
    public resolveConflicts() {
        let newChain: Block[];
        let peerRequests: Promise<Response>[] = [];

        for (let peer of this._peers) {
            peerRequests.push(fetch(`http://${peer}/chain`))
        }

        // peerRequests = peerRequests.map()
    }

    // Gera novo bloco
    public newBlock(proof: number): Block {
        
        let newBlock = new Block (
            this._chain.length,
            new Date().toISOString(),
            this._pendingTransactions,
            this._chain.length > 0 ? this._chain[this._chain.length - 1].hash : '1',
            proof
        );

        newBlock.seal();
        
        if (!newBlock.checkSeal())
            throw new Error ('blockSealCheckingFailed')
        else if (newBlock.index !== 0 && !this.checkProofOfWork(this._chain[this._chain.length - 1].proof, newBlock.proof, this._chain[this._chain.length - 1].previousHash))
            throw new Error ('blockProofCheckingFailed')
        else {
            this._chain.push(newBlock);
            this._pendingTransactions = [];
            return newBlock;
        }

    }

    // Registra uma nova transação para ir ao próximo bloco minerado   
    public newTransaction(transaction: Transaction): number {
        this._pendingTransactions.push(transaction);

        return this.lastBlock().index + 1
    }
    
    // Retorna o último bloco minerado
    public lastBlock(): Block {
        return this._chain[this._chain.length - 1];
    }

    // Calcula a prova de trabalho
    public generateProofOfWork(lastBlock: Block): number {
        
        // Algoritmo de Prova de Trabalho
        // Encontre um número p' tal que a hash(p + p') comece com 4 zeros
        // Onde p é a prova anterior, e p' é a nova prova

        let proof = 0;
        let lastProof = lastBlock.proof;
        let lastHash = lastBlock.hash;

        while (!this.checkProofOfWork(lastProof, proof, lastHash))
            ++proof
        
        return proof
    }
    
    // Verifica a prova de trabalho
    public checkProofOfWork(lastProof: number, proof: number, lastHash: string): boolean {
        let data = `${lastProof}${proof}${lastHash}`;
        let hash = shajs('sha256').update(data).digest('hex');
        
        return hash.startsWith('0000')
    }

    public get chain() {
        return this._chain;
    }

}