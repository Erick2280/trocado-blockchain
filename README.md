# Trocado Blockchain

_Uma implementação simples de blockchain em TypeScript_  
_Baseado em https://github.com/dvf/blockchain_

## Executando

Para executar localmente, você precisará da versão LTS do [Node.js](https://nodejs.org) mais recente.

Primeiro, no diretório raiz do projeto, execute o seguinte comando no terminal para instalar as dependências necessárias:

        npm install

Depois, execute:

        npm start -- [PORTA]

Sendo `[PORTA]` o número da porta que o servidor irá escutar. Caso nenhum número seja fornecido, o servidor escutará a porta 8080.

## TO-DO
 
 - Documentar
 - Organizar comentários
 - Configurar tslint
 - Configurar tsconfig (para gerar arquivos mais otimizados)
 - Interface
 - Argumentos (porta)
 - Melhorar tratamento de erro
 - Separar a lógica de conexão entre pares
 - - Salvar não só o endereço do par, mas o seu UUID
 - - Construir base de dados de trocados em posse de cada nó a partir do blockchain
 - Persistência de dados
 - Verificar transações
 - - Verificar se o nó pode transferir o valor
 - - Verificar se o nó é o `sender` da transação
 - Substituir clc.* por variáveis predefinidas