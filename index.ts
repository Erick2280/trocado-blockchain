import { Blockchain } from './blockchain';
import { Block } from './block';
import { Transaction } from './transaction';

import { uuid } from 'uuidv4';
import express from 'express';
import clc from 'cli-color';

console.log(clc.bold.green('TROCADO - Uma implementação simples de blockchain em TS/JS \n'));
console.log('Inicializando Trocado...')

// Inicialização do blockchain
console.log(`Inicializando blockchain...`)
let blockchain = new Blockchain(uuid());
console.log('Blockchain inicializada!')
console.log('Sou o par ' + clc.cyan(blockchain.peerUUID))

// Teste de validade da cadeia
console.log('A cadeia atual é ' + (blockchain.testChainValidity() ? clc.green('válida') : clc.red('inválida')))

// Inicialização da rede
console.log('Inicializando rede...')
const app = express();
app.use(express.json())
const port = 8084;

app.get( '/', ( req, res ) => {
    // TO-DO: Implementar uma visualização de página aqui
    res.status(200).send( "Olá! O servidor Trocado está funcionando." );
} );

app.get( '/mine', ( req, res ) => {
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

} );

app.post( '/transactions/new', ( req, res ) => {
    try {
        if (req.body.hasOwnProperty('sender') &&
            req.body.hasOwnProperty('receiver') &&
            req.body.hasOwnProperty('amount')) {

            let newTransaction = new Transaction(req.body.sender, req.body.receiver, req.body.amount);
            let blockIndex = blockchain.addTransaction(newTransaction);
            res.status(201).json({
                'message': 'Transação realizada',
                'transaction': newTransaction,
                'blockIndex': blockIndex
            })
            console.log(clc.green(`Transação de ${newTransaction.amount} trocados de ${newTransaction.sender} para ${newTransaction.receiver} realizada!`))

        } else {
            res.status(400).json({
                'message': 'Erro ao realizar transação',
                'error': 'Error: missingDataOnRequest'
            })
        }
    } catch (e) {
        console.log(clc.red(`Erro ao realizar transação. ${e}`))
        res.status(400).json({
            'message': 'Erro ao realizar transação',
            'error': e.toString()
        })
    }

} );

app.get( '/chain', ( req, res ) => {
    res.status(200).json({
        'chain': blockchain.chain,
        'length': blockchain.chain.length
    });
} );

app.post( '/nodes/register', ( req, res ) => {
    if (req.body.hasOwnProperty('nodes') && Array.isArray(req.body.nodes)) {
            let nodes = req.body.nodes;
            for (let node of nodes) {
                blockchain.addPeer(node);
            }

            res.status(201).json({
                'message': 'Novos nós inseridos',
                'nodes': blockchain.peers,
            })
            console.log(clc.green('Novos nós inseridos!'))

        } else {
            res.status(400).json({
                'message': 'Erro ao inserir nós',
                'error': 'Error: missingDataOnRequest'
            })
        }
} );

app.listen( port, () => {
    console.log(clc.bold('O servidor está escutando em ') + clc.cyan(`http://localhost:${port}`));
} );