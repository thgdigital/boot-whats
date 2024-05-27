const OpenAI = require('openai');
const banco = require("./db");
const readlineSync = require("readline-sync");
const colors = require("colors");

const {
    processarProduto,
    findByNameCategoria,
    findByNameCategoriaProduto,
    getProducName,
    setupconfiguracao,
    getCategoria,
    getCoreTamanhos,
    findByProducts,
    getProducts,
} = require('./produtoNuvem');

const nuvemshop = require("nuvemshop");
const venom = require('venom-bot');


let outputString = "";

const APP_ID = '11027';
const APP_SECRET = 'ecf9db5a12d93d2f545d06f6ba3fe08c4c90f9db';
const STORE_ID = '4511426';

nuvemshop.config({
    store_id: STORE_ID,
    access_token: APP_SECRET,
    user_agent: APP_ID
});



  const category = async () => {
    try{
        const category = await nuvemshop.listCategories();

        category.forEach(categoria => {
            categoria.name.pt = `*${categoria.name.pt}*`;
          });
        return category;

      }catch(error) {
        console.error("Erro ao gerar resposta:", error);
        return "Erro ao gerar resposta.";
      }
  }

  const setup = async () => {
    try{
         await setupconfiguracao();  
   }catch(error) {
    console.error("Error ao fazer configuração: "+ error)
 
}
}

setup().then((result) => {
    main();
});


getCoreTamanhos();
const openai = new OpenAI({
    apiKey: process.env.APIKEY_OPENAI, // This is the default and can be omitted
  });
  

  const userModel  = `
     *Informações do Chatbot*
      Você é o Gael, o assistente virtual da Faixinhas Moda Infantil! Estou aqui para ajudá-lo a encontrar os melhores produtos para os pequenos. Se precisar de alguma coisa, é só me chamar! 😊👕👟
      Seja educado, paciente e responda de forma clara e objetiva.
      Ofereça ajuda e sugestões de produtos.
      Seja transparente sobre as formas de pagamento e entrega.
      precisa responder meus cliente de forma coloquial para que nào descubra que esta falando com chatbot.
      Use emojis para deixar suas respostas mais divertidas e engajadoras.
    
      📍 Endereço da loja física: Rua da Bela Vista, 71 - Engenho Novo - RJ
      Telefone para contato: 21 98181-6853
    
      *Informações da Loja*
      👕 Tamanhos de roupa: 2, 4, 6, 8 e 10 anos.
      🩳 Tamanhos de chinelos: 18 ao 33.
      🛒 Link da nossa loja virtual: (https://faixinhasmoda.com.br/)
      💳 Formas de pagamento: PIX, CARTÃO DE CRÉDITO e Dinheiro (parcelamento com juros).
      🚚 Formas de entrega: Correio (para todo Brasil), Motoboy (apenas Rio de Janeiro) e Uber Moto (solicitado pelo cliente).
      Frete: Por conta do Cliente. 
      🚛 Frete: Por conta do Cliente. 
      Correio: Enviamos para todo Brasil. 
      ℹ️ Observações: Chinelos nos tamanhos 18 ao 24 são com elástico. Não realizamos trocas de peças brancas ou claras.
      📧 Status do pedido: Verifique sua caixa de e-mail cadastrada para receber atualizações sobre o seu pedido.
      📸 Solicitação de fotos: Se precisar, posso enviar link da foto dos produtos disponíveis em estoque.

      // Instruções que voce deve seguir
      Lembre-se de responder apenas sobre os produtos em estoque e sempre direcionar o cliente para finalizar a compra pelo site. No site, o cliente pode calcular o frete e escolher a forma de pagamento. Em caso de dúvidas, estou à disposição para ajudar! 😊🌟
      caso seja uber moto no site tem escolhe retirada na loja que assim verificamos a entrega. 
     
      Para garantir o ajuste perfeito do seu chinelo, siga estas simples instruções de medição:

    Em uma folha de papel em branco, coloque-se em pé com os calcanhares firmemente apoiados no chão.
    Com um lápis ou caneta, desenhe o contorno dos seus pés. Certifique-se de manter o lápis na vertical para obter medidas precisas.
    Meça a distância entre os pontos mais extremos do contorno do pé. Isso pode ser feito com uma régua ou fita métrica.    
    Use a tabela de tamanhos fornecida para comparar a medida obtida com os tamanhos disponíveis da Rakka. Escolha o tamanho que corresponda mais de perto à sua medida.
    Esta simples técnica de medição garantirá que você encontre o tamanho perfeito para desfrutar do conforto e estilo excepcionais da Rakka. Se precisar de assistência adicional, nossa equipe de atendimento ao cliente está à disposição para ajudar.
    `;

    let messageClient = 
    `
      Produtos disponíveis e catalogo
        ${outputString}
        `;

async function main() {
    console.log(colors.bold.green("estou apenas testando"))

    const numb = "21993732113"

    while(true) {
        const userInput = readlineSync.question(colors.yellow('Eu: '));

        try {
            if(userInput.toLocaleLowerCase() === 'sair'){
                return
            }

            const userCadastrado = banco.db.find(numero => numero.num === numb)

        if(!userCadastrado){
            banco.db.push({num: numb, historico: [] })
        }

        const historico = banco.db.find(numero => numero.num === numb)

        historico.historico.push("user: "+ userInput)
        
        // if (getTamanhos(userInput, historico.historico).length > 0 ) {
        //     let result = ""
        //     let prompt = `Identifique a intenção do cliente com base na últimas mensagem enviada: : ${userInput}.`;
            
        //     const response = await generateResponse(prompt, historico);

        //     if(response) {
        //     historico.historico.push("assistant: "+ response)
        //     let list = getTamanhos(response, historico.historico)

        //     let prompt = `Melhore visualização desse usuario no whataspp : ${list}.`;
            
        //     const response2 = await generateResponse(prompt, historico);
           
        //     list.forEach((value) => {
        //         result += findByProducts(value.product_id, value)
        //     })
        //         console.log(colors.green("assistant: ") + response2);
        //     }
          

        // }else if(contemSinonimoCatalogo(userInput)) { 
        //     category().then(async (results) => {
        //         const listaCategorias = results.map(categoria => categoria.name.pt).join(', ');
        //         const text = `🌟 Que legal que você está interessado em conferir nossos produtos! Para começar, escolha a categoria que mais lhe interessa.\nAs categorias disponíveis são: ${listaCategorias} `
        //         historico.historico.push("assistant: "+ text)
        //         console.log(colors.green("assistant: ") + text)
        //     })
        // } else {
            // const findByCat = await findByNameCategoria(userInput);
            // const termProduto = await getProducName(userInput)



            // if(findByCat) {
            //  findByNameCategoriaProduto(findByCat).then(async (results) => {
            //     const treinamento = `
            //     🔍 Você gostaria de produtos relacionado a "${findByCat}"
            //         Melehore a presentação dos Produtos disponíveis abaixo para que mostre os produtos para usario no whastapp.
            //         ${results}
            //     `
            //     const response = await generateResponse(treinamento, historico);

            //     if(response) {
            //     historico.historico.push("assistant: "+ response)
            //     //  await client.sendText(message.from, response);
            //     console.log(colors.green("assistant: ") + response)
            //     }
            //  })

            // }else if(termProduto) {
            //     const treinamento = `👋 Olá! Abaixo estão os produtos disponíveis para você conferir:\n ${termProduto}`
            //     historico.historico.push("assistant: "+ treinamento)
            //     // await client.sendText(message.from, treinamento);
            //     console.log(colors.green("assistant: ") + treinamento)
            //     console.log(colors.red("estou no termo"))
                
            // } else {
                const response = await generateResponse(userInput, historico);
                // Enviar a resposta de volta ao remetente
                if(response) {
                    historico.historico.push("assistant: "+ response)
                    // await client.sendText(message.from, response);
                    console.log(colors.green("assistant: ") + response)
                }
            // }


            // let prompt = `Identifique a intenção do cliente com base na últimas mensagem enviada: : ${userInput}. Depois me informas as palavras chave`;
            // const response = await generateResponse(prompt, historico);
            // console.error(colors.red("Intenção do usuario: "+ response))

        // }
            
        } catch (error) {
            console.error(colors.red(error))
        }
    }
}

//   venom
//   .create({
//     session: 'ChatGTP-Bot',
//   })
//   .then((client) => start(client))
//   .catch((error) => {
//     console.error("Erro ao iniciar o cliente Venom:", error);
//   });

function start(client) {
   
  client.onMessage(async (message) => {

    try {
      // Verificar se a mensagem não está vazia
      if (message && message.body && message.body.trim() === '') {
        console.log("A mensagem recebida está vazia. Ignorando...");
        return;
      }
      //TODO: Depois remover esse comentario 
      // if (message.type === 'chat' && message.from != "status@broadcast")  {
      //   console.log('Mensagem do from:', message.from);
      //   // Lógica para lidar com a mensagem do cliente aqui
      //   console.log('Mensagem do cliente:', message.body);
      // }else {
      //   console.log('Mensagem do from:', message.from);
      // }


      // Verificar se a mensagem é de um remetente específico
      if (message.from === "5521993732113@c.us" || message.from === "5521966476772@c.us") {
        const userCadastrado = banco.db.find(numero => numero.num === message.from)

        if(!userCadastrado){
            banco.db.push({num: message.from, historico: [] })
        }else{
            
        }

        const historico = banco.db.find(numero => numero.num === message.from)

        historico.historico.push("user: "+ message.body)
        
        if (getTamanhos(message.body, historico).length > 0 ) {
            let list = getTamanhos(message.body)
            let result = ""
            list.forEach((value) => {
                result += findByProducts(value.product_id, value)
            })

            let prompt = `Olá! Aqui estão algumas opções disponíveis: ${result} \n\n que usuario perquntou sempre verifiquei historico de mensagem para ver cliente esta escolhendo o produtos. Mensagem do usuario: ${message.body}. Lembre você eo robo de whatsapp enviei informão como as pessoal entende no whatsapp`;

            
            const response = await generateResponse(prompt, historico);

            if(response) {
                
            historico.historico.push("assistant: "+ response)
             await client.sendText(message.from, response);
            }
          

        }else if(contemSinonimoCatalogo(message.body)) { 
            category().then(async (results) => {
                const listaCategorias = results.map(categoria => categoria.name.pt).join(', ');
                const text = `🌟 Que legal que você está interessado em conferir nossos produtos! Para começar, escolha a categoria que mais lhe interessa.\nAs categorias disponíveis são: ${listaCategorias} `
                historico.historico.push("assistant: "+ text)
                await client.sendText(message.from, text);
            })
        } else {
            const findByCat = await findByNameCategoria(message.body);
            const termProduto = await getProducName(message.body)

            if(findByCat) {
             findByNameCategoriaProduto(findByCat).then(async (results) => {
                const treinamento = `
                🔍 Você gostaria de produtos relacionado a "${findByCat}"
                    Melehore a presentação dos Produtos disponíveis abaixo para que mostre os produtos para usario no whastapp.
                    ${results}
                `
                const response = await generateResponse(treinamento, historico);

                if(response) {
                historico.historico.push("assistant: "+ response)
                 await client.sendText(message.from, response);
                }
             })

            }else if(termProduto) {
                const treinamento = `👋 Olá! Abaixo estão os produtos disponíveis para você conferir:\n ${termProduto}`
                historico.historico.push("assistant: "+ treinamento)
                await client.sendText(message.from, treinamento);
            } else {
                const response = await generateResponse(message.body, historico);
                // Enviar a resposta de volta ao remetente
                if(response) {
                    historico.historico.push("assistant: "+ response)
                    await client.sendText(message.from, response);
                }
            }
        }
        console.log(historico.historico)
      }
    } catch (error) {
      console.error("Erro ao processar a mensagem:", error);
    }
  });
}

function getTamanhos(str) {
    let result = []
    console.log(colors.blue("STR: "+ str))
    const strNormalizada = str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const listTamanhos = getCoreTamanhos();

    // Normaliza a string para remover acentos e converte para minúsculas
    const strSemAcentos = removerAcentos(str.toLowerCase());
    const palavras = strSemAcentos.split(" ");


    for (const palavra of palavras) {
        for (const tamanho of listTamanhos) {
            tamanho.values.forEach((value) => {
                const newValue = removerAcentos(value.pt.toLowerCase());
                if (palavra == newValue && tamanho.stock > 0) {
                    result.push(tamanho)
                } else{
                    let barras = newValue.split("/");
               
                    if (barras) {
                        barras.forEach((barra) => {
                        if (barra == palavra && tamanho.stock > 0) {
                                result.push(tamanho)
                            }
                        })
    
                    }
                }
            })
        }
    }
    return result;
}

function contemSinonimoCatalogo(str) {
    // Lista de sinônimos da palavra "catálogo"
    const strNormalizada = str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

    const sinonimosCatalogo = [
        'lista de produtos',
        'inventario',
        'repertorio',
        'colecao',
        'portfolio',
        'assortimento',
        'catalogo de produtos',
        'catalogo digital',
        'catalogo online',
        'catalogo de servicos',
        'estoque',
        'acervo',
        'amostra',
        'mostruario',
        'exibicao',
        'rol',
        'rol de produtos',
        'registro de produtos',
        'relacao de produtos',
        'catalogo de mercadorias',
        'catalogo de itens',
        'catalogo',
        'tem catalogo',
        'gostaria de ver o catalogo',
];

    // Normaliza a string para remover acentos e converte para minúsculas
    const strSemAcentos = removerAcentos(str.toLowerCase());

    // Verifica se a string normalizada contém algum dos sinônimos
    for (const sinonimo of sinonimosCatalogo) {
        if (strSemAcentos.includes(removerAcentos(sinonimo))) {
            return true; // Retorna true se encontrar algum sinônimo
        }
    }
    return false; // Retorna false se não encontrar nenhum sinônimo
}


function removerAcentos(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, "");
}
async function generateResponse(message, historico) {
    try {
        const runner = openai.beta.chat.completions
        .runTools({
          model: 'gpt-3.5-turbo',
          messages: [
            {role: "assistant", content: userModel},
            {role: "assistant", content: "Historico de conversas: "+ historico.historico},
            { role: 'user', content: message },
        ],
          tools: [
            {
                type: 'function',
                function: {
                    function: searchProducts,
                    parameters: {
                    type: 'object',
                    properties: {
                        query: { type: 'string' },
                    },
                    },
                },
            }
          ],
        })
        .on('message', (message) =>
        
        console.log("message: " +JSON.stringify(message)));
    
      const finalContent = await runner.finalContent();

      historico.historico.push("assistant: "+ finalContent)
      console.log('Final content:', finalContent);
    } catch (error) {
        console.error("Erro ao gerar resposta:", error);
        return "Erro ao gerar resposta.";
      }
    }
    
    async function getCurrentLocation() {
        console.log(colors.yellow("Buscando dados..."))
      return 'Rio de janeiro'; // Simulate lookup
    }
    
    async function getWeather(args) {
      const { location } = args;
      // … do lookup …
      const temperature = 25; // Exemplo de temperatura
      const precipitation = 'Sunny'; // Exemplo de precipitação
        console.log("fui chamado")
        console.log(colors.red("Dados: "+ JSON.stringify()))
      return { temperature, precipitation };
    }
   
    const productsDatabase = {
        'camisa': ['Camisa Azul', 'Camisa Vermelha'],
        'calça': ['Calça Jeans', 'Calça Social'],
      };
      
      // Função personalizada que pesquisa produtos com base na pergunta do usuário
      async function searchProducts(args) {
        const { query } = JSON.parse(args);
        console.log(colors.red("Query: "+ query))
        const termProduto = await getProducts()
        let list = getTamanhos(query)
            let result = ""
            list.forEach((value) => {
                result += findByProducts(value.product_id, value)
            })
        // Simulação de busca de produtos no banco de dados
        if (termProduto.length === 0) {
          return `Não foram encontrados produtos para a consulta "${query}".`;
        } else {
          return `Produtos encontrados para "${termProduto}": ${termProduto.join(', ')}.`;
        }
      }