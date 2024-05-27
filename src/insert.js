import {getDBConfig, openAIEmbenddings, clientMongo} from "./database.js";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import * as fs from 'fs';

export async function uploadDocuments() {
    try {
        
        fs.readFile("novoprodutoExcel.json", 'utf8', function(error, data) {
            if (error) {
                console.log(error);
                return;
              }

              let banco = []
              let produtoString = "";
            const parsedData = JSON.parse(data);
            parsedData.forEach((produto) => {
                
                if(produto.Quantidade > 0) {
                    const nome = produto.Nome;
                    const categorias = produto.Tag;
                    const valor = produto.Valor;
                    const descricao = produto.Descrição
                    const estoque = produto.Quantidade
                    const imagem = produto.Imagems
                    const link = produto.Link
                    const tamanho = produto.tamanho
                    const cor = produto.cor
                   
                    produtoString = `Nome: ${nome} \nDescrição do produto: ${descricao} \nQuantidade em estoque: ${estoque} \nValor: ${valor} \nTamanho:${tamanho}\nCor: ${cor}\nLink de compra: ${link}\n Foto do Produto: ${imagem};`

                    banco.push({
                        expand_description: produtoString
                    })
                }
            })
            fs.writeFile ("novoProduto.json", JSON.stringify(banco), function(err) {
                if (err) throw err;
                console.log('complete');
              
            }
        );
        })
        await newUpload();
    } catch (error) {
        console.log("error ao fazer upload e arquivos")
        throw error
    }
}

async function addDocument() {
    try {
        
    } catch (error) {
        console.log("Error ao enviar ", error)
        throw error
    }
}


async function newUpload() {
    try {
        await clientMongo.connect();
            const loader = new JSONLoader("novoProduto.json");

            const docs = await loader.load();
            const vectorstore = await MongoDBAtlasVectorSearch.fromDocuments(docs, openAIEmbenddings, getDBConfig())
            await clientMongo.close();
            return loader.filePathOrBlob
    } catch (error) {
        console.log("Error upload: "+ error)
        throw error
    }
}