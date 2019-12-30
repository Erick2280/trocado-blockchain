import { Blockchain } from './blockchain';

import { uuid } from 'uuidv4';
import clc from 'cli-color';

console.log(clc.bold.green('TROCADO - A simple TS/JS blockchain implementation \n'));
console.log('Inicializando Trocado...')

// Geração de identificador único universal
let peerUUID =  uuid();
console.log('Sou o par ' + clc.blue(peerUUID))

console.log(`Inicializando blockchain...`)
let blockchain = new Blockchain();

console.log('Blockchain inicializada! Ainda estamos desconectados da rede.')

console.log('A cadeia atual é ' + (blockchain.testChainValidity() ? clc.green('válida') : clc.red('inválida')))

// TO-DO: implementar o servidor


