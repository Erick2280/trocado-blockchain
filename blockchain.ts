import { Block } from './block';
import { Transaction } from './transaction';

export class Blockchain {
    private _chain: Block[];
    private _pendingTransactions: Block[];
    private _peers: string[]; 

    constructor() {
        this._chain = [];
        this._pendingTransactions = [];
        this._peers = [];
    }

    // adicionar e pegar nós

    // testar se a blockchain é válida

    // resolvedor conflitos

    // gera novo bloco

    // gera nova transação

    // retorna último bloco

    // retorna todos os blocos

    // prova de trabalho

    // valida a prova



}