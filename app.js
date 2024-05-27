const venom = require('venom-bot');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require('axios');
const genAI = new GoogleGenerativeAI("AIzaSyDs0zTnLAIHjyNpNtzmXSbMmHZzdr1W9Cs");
const fs = require('fs');
const nuvemshop = require("nuvemshop");
const processarProduto = require('./produtoNuvem');
const openai = require('openai');




// Nome do arquivo JSON a ser lido
const nomeArquivo = 'produtos.json';
let outputString = "";
const APP_ID = '11027';
const APP_SECRET = 'ecf9db5a12d93d2f545d06f6ba3fe08c4c90f9db';
const STORE_ID = '4511426';

// Função principal do aplicativo
const app = async () => {
  nuvemshop.config({
      store_id: STORE_ID,
      access_token: APP_SECRET,
      user_agent: APP_ID
  });

  try{
    const produtos = await nuvemshop.listProducts();

    produtos.forEach(produto => {
      outputString += processarProduto(produto);
    });
  return outputString;
  }catch(error) {
    console.error("Erro ao gerar resposta:", error);
    return "Erro ao gerar resposta.";
  }

  

};


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
    s
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

const history = [
  {
    role: "user",
    parts: [
      {
        text: userModel
      }
  ]
  },
  {
    role: "model",
    parts: [
      { 
        text: "ok"
      }
    ]
  }
];




async function generateResponse(message, idTelefone) {
  try {

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    if (!model) {
      console.error("Não foi possível obter o modelo de geração.");
      return "Erro ao obter o modelo de geração.";
    }
        
    const chat = model.startChat({
      history: history,
      generationConfig: { 
        maxOutputTokens: 500 
      }
    });
   
    const resultString = message.from.replace("/55|@c\.us/g", '');
      const treinamento  = `
      // Informações do Chatbot
      Você é o Gael, chatbot de uma loja especializada em vestuário infantil masculino. 
      Seja educado, paciente e responda de forma clara e objetiva.
      Ofereça ajuda e sugestões de produtos.
      Seja transparente sobre as formas de pagamento e entrega.
      precisa responder meus cliente de forma coloquial para que nào descubra que esta falando com chatbot.
      Use emojis para deixar suas respostas mais divertidas e engajadoras.
     
  
      // Informações da Loja
      Tamanhos de roupa: 2, 4, 6, 8 e 10 anos.
      Tamanhos de chinelos: 18 ao 33.
      Formas de pagamento: PIX, CARTÃO DE CRÉDITO e Dinheiro.
      Formas de entrega: Correio, Motoboy (somente Rio de Janeiro) e Uber Moto (solicitado pelo cliente).
      Frete: Por conta do Cliente. 
      Não trocamos peças brancas e claras.
      O cliente tem finalizar a compra pelo site todo produto tem um link que estou fornecendo so pegar esse link e enviar para o cliente explicar ele como realizar compra pelo site.   
      No site ele consegue calcular o frete e realizar pagamento, caso seja uber moto no site tem escolhe retirada na loja que assim verificamos a entrega. 

      // Produtos disponíveis e catalogo
      Chinelo Kenner Baby Preto - Tamanhos 17/18 - 2 unidades em estoque  - Valor R$ 59,99 -  Link do produto https://faixinhasmoda.com.br/produtos/sandalia-kenner-rakka-l7/ - Image do produto: https://acdn.mitiendanube.com/stores/003/825/498/products/whatsapp-image-2024-01-13-at-14-09-16-88f1e4770f91e4bb8017053704122538-1024-1024.webp
      Chinelo Kenner Baby Preto - Tamanhos 19/20 - 2 unidades em estoque - Valor R$ 59,99  - Link do produto https://faixinhasmoda.com.br/produtos/sandalia-kenner-rakka-l7/ - Image do produto: https://acdn.mitiendanube.com/stores/003/825/498/products/whatsapp-image-2024-01-13-at-14-09-16-88f1e4770f91e4bb8017053704122538-1024-1024.webp
      Chinelo Kenner Baby Preto - Tamanhos 21/22 - 2 unidades em estoque - Valor R$ 59,99  - Link do produto https://faixinhasmoda.com.br/produtos/sandalia-kenner-rakka-l7/ - Image do produto: https://acdn.mitiendanube.com/stores/003/825/498/products/whatsapp-image-2024-01-13-at-14-09-16-88f1e4770f91e4bb8017053704122538-1024-1024.webp
      Chinelo Kenner Baby Preto - Tamanhos 23/24 - 2 unidades em estoque - Valor R$ 59,99  - Link do produto https://faixinhasmoda.com.br/produtos/sandalia-kenner-rakka-l7/ - Image do produto: https://acdn.mitiendanube.com/stores/003/825/498/products/whatsapp-image-2024-01-13-at-14-09-16-88f1e4770f91e4bb8017053704122538-1024-1024.webp
    
      Chinelo Kenner Baby Branco - Tamanhos 17/18 - 2 unidades em estoque  - Valor R$ 59,99  -  Link do produto https://faixinhasmoda.com.br/produtos/sandalia-kenner-rakka-l7/ - Image do produto: https://acdn.mitiendanube.com/stores/003/825/498/products/whatsapp-image-2024-01-13-at-14-09-04-a5a6ad0e258e77c4d517053703675220-1024-1024.webp
      Chinelo Kenner Baby Branco - Tamanhos 19/20 - 2 unidades em estoque - Valor R$ 59,99  - Link do produto https://faixinhasmoda.com.br/produtos/sandalia-kenner-rakka-l7/ -  Image do produto:  https://acdn.mitiendanube.com/stores/003/825/498/products/whatsapp-image-2024-01-13-at-14-09-04-a5a6ad0e258e77c4d517053703675220-1024-1024.webp
      Chinelo Kenner Baby Branco - Tamanhos 21/22 - 2 unidades em estoque - Valor R$ 59,99  - Link do produto https://faixinhasmoda.com.br/produtos/sandalia-kenner-rakka-l7/ - Image do produto:  https://acdn.mitiendanube.com/stores/003/825/498/products/whatsapp-image-2024-01-13-at-14-09-04-a5a6ad0e258e77c4d517053703675220-1024-1024.webp
      Chinelo Kenner Baby Branco - Tamanhos 23/24 - 2 unidades em estoque - Valor R$ 59,99  - Link do produto https://faixinhasmoda.com.br/produtos/sandalia-kenner-rakka-l7/ - Image do produto:  https://acdn.mitiendanube.com/stores/003/825/498/products/whatsapp-image-2024-01-13-at-14-09-04-a5a6ad0e258e77c4d517053703675220-1024-1024.webp
      Obs: chinelos Numerações do 18 ao 24 são com elastico.
      Obs: Não trocamos peças Branca e claras.
    
      // Mensagem do cliente
      ${message.body}
    
      // Dados do cliente
      Nome: ${message.notifyName} 
      Telefone: ${resultString}
    
      // Instruções que voce deve seguir
      Responda ao cliente apenas sobre os produtos que estão em estoque.
      Se o cliente escolher a forma de pagamento via Pix, crie uma resposta no seguinte formato para que posteriomente consigo criar link de pagamento com minha api: 
      Se o cliente escolher a forma de entrega via Correios, pergunte qual tipo de frete ele prefere (PAC ou Sedex). Em seguida, solicite o CEP do cliente e responda no seguinte formato:
      Forma de envio: [correio] - Tipo de frete: [PAC ou Sedex] - CEP: [CEP do cliente válido]
      `;

    let messageClient = 
    `
      Produtos disponíveis e catalogo
        ${outputString}
      Mensagem do cliente
        ${message.body}
    `

      const result = await chat.sendMessage(messageClient);
      const text = result.response.text();

      console.log(messageClient)
      // Verificar se a mensagem não está vazia
      if (text && text.trim() === '') {
        console.log("A mensagem recebida está vazia. Ignorando...");
        return;
      }

      console.log("Resposta gerada com sucesso:", text);
      return text;
  } catch (error) {
    console.error("Erro ao gerar resposta:", error);
    return "Erro ao gerar resposta.";
  }
}

venom
  .create({
    session: 'ChatGTP-Bot',
  })
  .then((client) => start(client))
  .catch((error) => {
    console.error("Erro ao iniciar o cliente Venom:", error);
  });

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


        const response = await generateResponse(message, message.from);
        // Enviar a resposta de volta ao remetente
        if(response) {
          await client.sendText(message.from, response);
        }
      }
    } catch (error) {
      console.error("Erro ao processar a mensagem:", error);
    }
  });
}