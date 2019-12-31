/** 
 * Trocado Blockchain
 * Uma implementação simples de blockchain em TypeScript
 *  
*/

import { Blockchain } from './blockchain';
import { Block } from './block';
import { Transaction } from './transaction';

import { uuid } from 'uuidv4';
import express from 'express';
import clc from 'cli-color';

console.log(clc.bold.green('TROCADO - Uma implementação simples de blockchain em TS/JS \n'));
console.log('Inicializando Trocado...')

// Inicializa a blockchain
console.log(`Inicializando blockchain...`)
let blockchain = new Blockchain(uuid());
console.log('Blockchain inicializada!')
console.log('Sou o par ' + clc.cyan(blockchain.peerUUID))

// Testa a validade da cadeia
console.log('A cadeia atual é ' + (blockchain.checkChainValidity() ? clc.green('válida') : clc.red('inválida')))

// Inicializa o Express
console.log('Inicializando rede...')
const app = express();
app.use(express.json());

// TO-DO: Tratamento de argumentos
const port = process.argv[2] ? process.argv[2] : 8080;

app.get('/', (req, res) => {
    // TO-DO: Implementar uma visualização de página aqui
    res.status(200).send("Olá! O servidor Trocado está funcionando.");
});

// TO-DO: async
app.get('/mine', (req, res) => {
    try {
        console.log(clc.blue('Minerando bloco...'))
        let newBlock: Block = blockchain.mine();
        res.status(200).json({
            'message': 'Novo bloco minerado',
            'block': newBlock
        })
        console.log(clc.green(`Bloco nº ${newBlock.index} (${newBlock.hash}) minerado!`))
    } catch (e) {
        console.log(clc.red(`Erro ao minerar bloco. ${e}`))
        res.status(500).json({
            'message': 'Erro ao minerar bloco',
            'error': e.toString()
        })
    }

});

app.post('/transactions/new', (req, res) => {
    try {
        if (!(req.body.hasOwnProperty('sender') && req.body.hasOwnProperty('receiver') && req.body.hasOwnProperty('amount')))
            throw new Error('missingDataOnRequest')

        let newTransaction = new Transaction(req.body.sender, req.body.receiver, req.body.amount);
        let blockIndex = blockchain.addTransaction(newTransaction);
        res.status(201).json({
            'message': 'Transação realizada',
            'transaction': newTransaction,
            'blockIndex': blockIndex
        })
        console.log(clc.green(`Transação de ${newTransaction.amount} trocados de ${newTransaction.sender} para ${newTransaction.receiver} realizada!`))


    } catch (e) {
        console.log(clc.red(`Erro ao realizar transação. ${e}`))
        res.status(400).json({
            'message': 'Erro ao realizar transação',
            'error': e.toString()
        })
    }

});

app.get('/chain', (req, res) => {
    res.status(200).json({
        'chain': blockchain.chain,
        'chainLength': blockchain.chain.length
    });
});

app.get('/chain/check', (req, res) => {
    let checkResult = blockchain.checkChainValidity();

    res.status(200).json({
        'message': 'A cadeia atual é ' + (checkResult ? 'válida' : 'inválida'),
        'checkResult': checkResult
    });

    console.log('A cadeia atual é ' + (checkResult ? clc.green('válida') : clc.red('inválida')))
});

app.get('/nodes', (req, res) => {
    res.status(200).json({
        'nodes': blockchain.peers,
        'nodesLength': blockchain.peers.length
    });
});


app.post('/nodes/register', (req, res) => {
    try {
        if (!(req.body.hasOwnProperty('nodes') && Array.isArray(req.body.nodes) && req.body.nodes.length > 0))
            throw new Error('missingDataOnRequest')

        let nodes = req.body.nodes;
        for (let node of nodes) {
            blockchain.addPeer(node);
        }

        res.status(201).json({
            'message': 'Novos nós inseridos',
            'nodes': blockchain.peers,
        })
        console.log(clc.green('Novos nós inseridos!'))

    } catch (e) {
        res.status(400).json({
            'message': 'Erro ao inserir nós',
            'error': e.toString()
        })
    }
});

// TO-DO: async
app.get('/nodes/resolve', async (req, res) => {
    let resolveResult = await blockchain.resolveConflicts();

    res.status(200).json({
        'message': 'A cadeia atual ' + (resolveResult ? 'foi substituída' : 'é autoritativa'),
        'resolveResult': resolveResult,
        'chain': blockchain.chain
    });

    console.log('A cadeia atual ' + (resolveResult ? clc.green('foi substituída') : clc.blue('é autoritativa')))

});

app.listen(port, () => {
    console.log(clc.bold('O servidor está escutando em ') + clc.cyan(`http://localhost:${port}`));
});