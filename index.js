const fs = require('fs');
const csv = require('csv-parser');

const somaProdutos = {};
const valoresProdutos = {};
let numPeriodos = 0;

fs.createReadStream('aula1Dados.csv')
  .pipe(csv({ separator: ';', mapHeaders: ({ header }) => header.trim() }))
  .on('headers', (headers) => {
 
    numPeriodos = headers.length - 1;
  })
  .on('data', (row) => {
    const nomeProduto = row[Object.keys(row)[0]];
    if (!nomeProduto) return;

    const valores = Object.values(row).slice(1);

    if (!somaProdutos[nomeProduto]) {
      somaProdutos[nomeProduto] = 0;
      valoresProdutos[nomeProduto] = [];
    }

    valores.forEach(valorStr => {
      if (valorStr) {
        const valor = parseFloat(valorStr.replace('R$ ', '').replace(',', '.'));
        if (!isNaN(valor)) {
          somaProdutos[nomeProduto] += valor;
          valoresProdutos[nomeProduto].push(valor);
        } else {
          console.warn(`Valor inválido: "${valorStr}"`);
        }
      }
    });
  })
  .on('end', () => {
    if (Object.keys(somaProdutos).length === 0) {
      console.log('Nenhuma linha de dados encontrada no arquivo.');
      return;
    }

    const mediaProdutos = {};
    const variacaoProdutos = {};

    for (const produto in somaProdutos) {
      const valores = valoresProdutos[produto];
      if (valores.length > 0) {
        const max = Math.max(...valores);
        const min = Math.min(...valores);
        const variacao = max - min;

        mediaProdutos[produto] = (somaProdutos[produto] / valores.length).toFixed(2).replace('.', ',');
        variacaoProdutos[produto] = variacao.toFixed(2).replace('.', ',');
      }
    }

    const produtoMaiorVariacao = Object.keys(variacaoProdutos).reduce((maxProduto, produto) => {
      return variacaoProdutos[produto] > (variacaoProdutos[maxProduto] || 0) ? produto : maxProduto;
    });

    const larguraProduto = Math.max(...Object.keys(somaProdutos).map(produto => produto.length), 20);

    console.log('------------------------------');
    console.log(`Total de períodos: ${numPeriodos}`);
    console.log('------------------------------');

    console.log('Média por produto:');
    Object.keys(mediaProdutos).forEach(produto => {
      console.log(` ${produto.padEnd(larguraProduto)}: Média: R$ ${mediaProdutos[produto]}`);
    });

    console.log('------------------------------');
    console.log('Variação por produto:');
    Object.keys(variacaoProdutos).forEach(produto => {
      console.log(` ${produto.padEnd(larguraProduto)}: Variação: R$ ${variacaoProdutos[produto]}`);
    });

    console.log('------------------------------');
    console.log(`Produto com maior variação: ${produtoMaiorVariacao}`);
    console.log('------------------------------');
    console.log('Arquivo CSV "aula1Dados.csv" processado com sucesso!');
    console.log('------------------------------');
  });
