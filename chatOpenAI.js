
import {ChatOpenAI}  from "@langchain/openai";
import {PromptTemplate}  from "@langchain/core/prompts";
import {RetrievalQAChain } from "langchain/chains";
import {BufferMemory } from "langchain/memory";
import { clientMongo, vectorstore} from "./src/database.js";
import { uploadDocuments } from "./src/insert.js"
import { sleep } from "./src/util.js";
import { create } from 'venom-bot';
import { MongoDBChatMessageHistory } from "@langchain/mongodb";
import * as fs from 'fs';
import { extension} from "mime-types"
import {OpenAI} from "openai"
import { HumanMessage } from "@langchain/core/messages";
import { OpenAIEmbeddings}  from "@langchain/openai";
import * as dotenv from 'dotenv'




dotenv.config()

const openAichat = new ChatOpenAI({
    apiKey: process.env.APIKEY_OPENAI,
    model: "gpt-4o",
    temperature: 0.1,
})


const collection = clientMongo.db("sample_mflix").collection("memory");
// Use this tool when searching for information about lanchain expression language (LCEL)
// await uploadDocuments()


create({
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

      //0800 400 5300
    //   (message.from === "5521993732113@c.us" || message.from === "5521966476772@c.us")
    //   (message.type === 'chat' && message.from != "status@broadcast")
    
    const typeChat = ["ptt", "chat", "image"]

    if (typeChat.includes(message.type) && message.from != "status@broadcast") {
        if (message.mimetype === 'audio/ogg; codecs=opus') {
            console.log(message)
            const buffer = await client.decryptFile(message);
            // At this point you can do whatever you want with the buffer
            // Most likely you want to write it into a file
            let sessionId = message.from
            const fileName = `${sessionId}.${extension(message.mimetype)}`;

            
            fs.writeFile(fileName, buffer, (err) => {
                console.log(err)

            });
           const text =  await loadAudioToText(fileName)
           const result = await main(text, message.from)
           await client.sendText(message.from, result);

        } else if(message.type === 'image'){
          await image(message.body)
        }else {
            const result = await main(message.body, message.from)
            await client.startTyping(message.from);
            await sleep(3000)
            await client.sendText(message.from, result);
          }
    }

    }catch(error){
        console.log("Error: "+ error)
        throw error
    }
    })
  }
async function main(text, from) {
    // generate a new sessionId string
    const sessionId = from.replace("/55|@c\.us/g", '');
    
    await clientMongo.connect()

    const memory = new BufferMemory({
        memoryKey: "chat_history",
        inputKey: "question",
        outputKey: "text",
        chatHistory: new MongoDBChatMessageHistory({
            collection,
            sessionId,
        })
    })

    const prompt = new PromptTemplate({
        template: `
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
        🛒 Link da nossa loja virtual: https://faixinhasmoda.com.br/
        💳 Formas de pagamento: PIX, CARTÃO DE CRÉDITO e Dinheiro (parcelamento com juros).
        🚚 Formas de entrega: Correio (para todo Brasil), Motoboy (apenas Rio de Janeiro) e Uber Moto (solicitado pelo cliente).
        Frete: Por conta do Cliente. 
        🚛 Frete: Por conta do Cliente. 
        Correio: Enviamos para todo Brasil. 
        ℹ️ Observações: Chinelos nos tamanhos 18 ao 24 são com elástico. Não realizamos trocas de peças brancas ou claras.
        📧 Status do pedido: Verifique sua caixa de e-mail cadastrada para receber atualizações sobre o seu pedido.
        📸 Solicitação de fotos: Se precisar, posso enviar link da foto dos produtos disponíveis em estoque.

        // Instruções que voce deve seguir
        Sempre mostrar seguintes informações quando tiver disponivel: (Nome, descrição, link de compra e foto se tiver). 
        Lembre-se de responder apenas sobre os produtos em estoque e sempre direcionar o cliente para finalizar a compra pelo site. No site, o cliente pode calcular o frete e escolher a forma de pagamento. Em caso de dúvidas, estou à disposição para ajudar! 😊🌟
        caso seja uber moto no site tem escolhe retirada na loja que assim verificamos a entrega. 
        Para garantir o ajuste perfeito do seu chinelo, siga estas simples instruções de medição:
        
        Mostrar de forma que o cliente conseguer visualizar

        Em uma folha de papel em branco, coloque-se em pé com os calcanhares firmemente apoiados no chão.
        Com um lápis ou caneta, desenhe o contorno dos seus pés. Certifique-se de manter o lápis na vertical para obter medidas precisas.
        Meça a distância entre os pontos mais extremos do contorno do pé. Isso pode ser feito com uma régua ou fita métrica.    
        Use a tabela de tamanhos fornecida para comparar a medida obtida com os tamanhos disponíveis da Rakka. Escolha o tamanho que corresponda mais de perto à sua medida.
        Esta simples técnica de medição garantirá que você encontre o tamanho perfeito para desfrutar do conforto e estilo excepcionais da Rakka. Se precisar de assistência adicional, nossa equipe de atendimento ao cliente está à disposição para ajudar.
       
        Aqui estão alguns tamanhos duplos e os tamanhos correspondentes:
        17/28  -> Corresponde a 17 ou 18
        19/20 -> Corresponde a 19 ou 20
        21/22 -> Corresponde a 21 ou 22
        23/24 -> Corresponde a 23 ou 24
        25/26 -> Corresponde a 25 ou 26
        26/27 -> Corresponde a 26 ou 27
        27/28 -> Corresponde a 27 ou 28
        28/29 -> Corresponde a 28 ou 29
        29/30 -> Corresponde a 29 ou 30
        30/31 -> Corresponde a 30 ou 31
        31/32 -> Corresponde a 31 ou 32
        32/33 -> Corresponde a 32 ou 33
        33/34 -> Corresponde a 33 ou 34
        34/35 -> Corresponde a 34 ou 35
        35/36 -> Corresponde a 35 ou 36
        36/37 -> Corresponde a 36 ou 37
        37/38 -> Corresponde a 37 ou 38
        38/39 -> Corresponde a 38 ou 39
        39/40 -> Corresponde a 39 ou 40
        19/20 -> Corresponde a 19 ou 20
        21/22 -> Corresponde a 21 ou 22
        23/24 -> Corresponde a 23 ou 24
        25/26 -> Corresponde a 25 ou 26
        26/27 -> Corresponde a 26 ou 27
        27/28 -> Corresponde a 27 ou 28
        28/29 -> Corresponde a 28 ou 29
        29/30 -> Corresponde a 29 ou 30
        30/31 -> Corresponde a 30 ou 31
        31/32 -> Corresponde a 31 ou 32
        32/33 -> Corresponde a 32 ou 33
        33/34 -> Corresponde a 33 ou 34
        34/35 -> Corresponde a 34 ou 35
        35/36 -> Corresponde a 35 ou 36
        36/37 -> Corresponde a 36 ou 37
        37/38 -> Corresponde a 37 ou 38
        38/39 -> Corresponde a 38 ou 39
        39/40 -> Corresponde a 39 ou 40

        Produto disponvel em Estoque:
        {context}
        Perqunta do Cliente:
        {question}
        Historico da conversa:
        {chat_history}
        `,
        inputVariables:["context", "question", "chat_history"]
    })


    const chain = RetrievalQAChain.fromLLM(openAichat, vectorstore.asRetriever({
        k: 11
    }), {
        prompt,
        returnSourceDocuments: false,
        verbose: false,
        memory
    })

    const response = await chain.invoke({
        query: text,
        question: text,
    })

    console.log("Response: ", response)
    return response.text
}


async function image(imageData) {
    try {

        const chat = new OpenAIEmbeddings({
            model: "text-embedding-3-large",
            apiKey: process.env.APIKEY_OPENAI,
        });

        const vectors2 = await chat.embedDocuments([imageData]);
        console.log(vectors2);
          
    } catch (error) {
        console.error("Error" , error)
        throw error
    }
}

async function loadAudioToText(fileName) {
    try {
        const openai = new OpenAI({
            apiKey: process.env.APIKEY_OPENAI, // This is the default and can be omitted
        });

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(fileName),
            model: "whisper-1",
            language: "pt",
        })

        fs.unlink(fileName, (err) => {
            if (err) {
              console.error(`Error removing file: ${err}`);
              return;
            }
          
            console.log(`File ${fileName} has been successfully removed.`);
        });
        return transcription.text
    } catch (error) {
        console.log("Error", error)
        throw error
    }
}

