import { Block } from './block';
import { Transaction } from './transaction';

import shajs from 'sha.js'
import fetch from 'node-fetch';

/**
 * Classe responsável por gerenciar as operações na blockchain.
 */
export class Blockchain {

    /** Cadeia local de blocos */
    private _chain: Block[];

    /** Transações pendentes */
    private _pendingTransactions: Transaction[];

    /** Pares registrados */
    private _peers: string[]; 

    /** Identificador único universal do par local na rede */
    private _peerUUID: string;

    /**
     * Cria uma instância da classe Blockchain
     * @param peerUUID Identificador único universal do par local na rede
     */
    constructor(peerUUID: string) {
        this._chain = [];
        this._pendingTransactions = [];
        this._peers = [];
        this._peerUUID = peerUUID;
        
        // Gera o bloco genesis
        this.addBlock();
    }
    
    /**
     * Adiciona um par na array de pares.
     * @param peer Endereço do par na forma `endereço:porta`
     */
    public addPeer(peer: string) {
        this._peers.push(peer);
    }
    
    /**
     * Verifica se uma dada cadeia é válida. Caso nenhuma cadeia seja passada, verifica a cadeia local.
     * @param [chain] A cadeia a ser verificada
     * @returns `true` caso a cadeia seja válida
     */
    public checkChainValidity(chain: Block[] = this._chain): boolean {

        // Verificações no bloco genesis

        // - o índice deve ser zero
        if (chain[0].index !== 0)
            return false
        
        // - a hash precisa estar correta
        if (!chain[0].checkSeal())
            return false

        // - o bloco deve ter zero transações
        if (chain[0].transactions.length !== 0)
            return false
        
        // Verificações nos blocos subsequentes

        for (let i = 1; i < chain.length; ++i) {
            // - o campo da hash anterior no bloco atual deve ser igual ao campo hash no bloco anterior
            if (chain[i].previousHash !== chain[i - 1].hash)
                return false
            
            // - o campo índice do bloco deve conferir com seu índice
            if (chain[i].index !== i)
                return false

            // - a hash precisa estar correta
            if (!chain[i].checkSeal())
                return false

            // - a prova de trabalho deve ser válida
            if (!this.checkProofOfWork(chain[i].proof, chain[i - 1].proof, chain[i - 1].hash))
                return false
        }

        return true;
    }

    /**
     * Consulta as cadeias dos pares e substitui a cadeia local caso esteja desatualizada.
     * TO-DO: Separar a lógica de verificação da cadeia da busca em outros pares.
     * @returns `true` caso a cadeia local tenha sido substituída 
     */
    public async resolveConflicts(): Promise<boolean> {
        let newChain: Block[];
        let peerResponses: Promise<any>[] = [];

        for (let peer of this._peers) {
            peerResponses.push(fetch(`http://${peer}/chain`)) // Cria uma requisição para cada par do array de pares registrados
        }

        peerResponses = peerResponses.map(p => p.catch(e => e)) // Ignora requisições com erro

        // Espera até que todas as requisições sejam concluídas
        await Promise.all(peerResponses).then(async responses => {
            for (let response of responses) {
                let data = await response.json()

                // Verifica as respostas de requisições realizadas aos pares
                try {
                    // A requisição tem os dados necessários?
                    if (!(data.hasOwnProperty('chain') && data.hasOwnProperty('chainLength')))
                        throw new Error('responsePropertyMissing')
                    
                    // A cadeia do par remoto é maior que alguma cadeia local (atual ou nova)?
                    if (!(data.chainLength > this._chain.length && (newChain === undefined || data.chainLength > newChain.length)))
                        throw new Error('localChainGreaterThanRemote')

                    // Se sim, a cadeia candidata é processada
                    let candidateChain: Block[] = [];

                    for (let blockData of data.chain) {
                        let block = new Block();
                        block.fromObject(blockData)
                        candidateChain.push(block);
                    }

                    // A cadeia candidata é válida?
                    if (!this.checkChainValidity(candidateChain))
                        throw new Error('remoteChainIsInvalid')

                    // Se sim, a cadeia candidata é elevada à nova cadeia
                    newChain = candidateChain;

                } catch (e) {} // Ignora e passa para a próxima resposta caso a atual não passe nos testes
            }
        });

        // Caso exista uma nova cadeia, ela é eleita como a cadeia atual
        if (newChain !== undefined) {
            this._chain = newChain;
            return true;
        }

        return false;
    }

    /**
     * Adiciona um novo bloco na cadeia de blocos.
     * @param [proof] Prova de trabalho do bloco
     * @returns Novo bloco adicionado a cadeia 
     */
    private addBlock(proof: number = 100): Block {
        
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
        if (newBlock.index !== 0 && !this.checkProofOfWork(newBlock.proof, this._chain[this._chain.length - 1].proof, this._chain[this._chain.length - 1].hash))
            throw new Error ('blockProofCheckingFailed')
        
        this._chain.push(newBlock);
        this._pendingTransactions = [];
        return newBlock;
        

    }

    /**
     * Registra uma nova transação para ir ao próximo bloco minerado.
     * @param transaction Nova transação a ser adicionada
     * @returns Índice do bloco em que a transação será armazenada
     */  
    public addTransaction(transaction: Transaction): number {
        this._pendingTransactions.push(transaction);

        return this.lastBlock().index + 1
    }
    
    /** 
     * Retorna o último bloco minerado
     * @returns O último bloco minerado 
     */
    public lastBlock(): Block {
        return this._chain[this._chain.length - 1];
    }

    /**
     * Calcula a prova de trabalho.
     * @param lastBlock Último bloco na cadeia
     * @returns Prova de trabalho para o próximo bloco
     */
    private generateProofOfWork(lastBlock: Block): number {
        
        // Algoritmo de Prova de Trabalho
        // Encontre um número p' tal que a hash(p + p') comece com 4 zeros
        // Onde p é a prova anterior, e p' é a nova prova
        
        let proof = 0;
        let lastProof = lastBlock.proof;
        let lastHash = lastBlock.hash;

        while (!this.checkProofOfWork(proof, lastProof, lastHash))
            ++proof
        
        return proof
    }
    
    /**
     * Verifica se a prova de trabalho é válida.
     * @param proof Prova de trabalho a ser verificada
     * @param lastProof Prova de trabalho do bloco anterior 
     * @param lastHash Hash do bloco anterior
     * @returns `true` se a prova de trabalho for válida
     */
    private checkProofOfWork(proof: number, lastProof: number, lastHash: string): boolean {
        let data = `${lastProof}${proof}${lastHash}`;
        let hash = shajs('sha256').update(data).digest('hex');
        
        return hash.startsWith('0000')
    }

    /**
     * Minera um novo bloco na blockchain.
     * TO-DO: Assíncrono? 
     * @returns O novo bloco minerado 
     */
    public mine(): Block {

        // Calcula um prova de trabalho para o último bloco
        let lastBlock = this.lastBlock();
        let proof = this.generateProofOfWork(lastBlock);

        // Já que a prova de trabalho foi realizada, receberemos um
        // prêmio: 100 trocados. O remetente é 'mined'.
        let mineTransaction  = new Transaction (
            'mined',
            this._peerUUID,
            100);
        this.addTransaction(mineTransaction)

        // Gera o novo bloco e o adiciona na cadeia
        let newBlock = this.addBlock(proof);

        return newBlock;
    }

    public get chain() {
        return this._chain;
    }

    public get peerUUID() {
        return this._peerUUID;
    }

    public get peers() {
        return this._peers;
    }

    public get pendingTransactions() {
        return this._pendingTransactions;
    }

}