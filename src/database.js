import { MongoClient, ServerApiVersion } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { OpenAIEmbeddings}  from "@langchain/openai";
import * as dotenv from 'dotenv'

dotenv.config()
// const uri = "mongodb://localhost:27017/?directConnection=true";
const uri = "mongodb+srv://tvazsantos:MsfH18mHkzOmohPT@faixinhas.s8lqxnr.mongodb.net/?retryWrites=true&w=majority&appName=faixinhas";

    export const clientMongo = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: false,
            deprecationErrors: true,
        }
    });

    const collection = clientMongo.db("sample_mflix").collection("faixinhasmoda");

    export const openAIEmbenddings = new OpenAIEmbeddings({
        apiKey: process.env.APIKEY_OPENAI,
    })


    export const vectorstore = new MongoDBAtlasVectorSearch(openAIEmbenddings, getDBConfig());
   
    export function getDBConfig() {

        const dbConfig = {  
            collection: collection,
            indexName: "vector_index", // The name of the Atlas search index to use.
            textKey: "text", // Field name for the raw text content. Defaults to "text".
            embeddingKey: "embedding", // Field name for the vector embeddings. Defaults to "embedding".
        }

        return dbConfig
    }
