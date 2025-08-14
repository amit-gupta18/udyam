console.log("this is server index.ts")
import express from 'express'
import cors from 'cors'


const app = express();

app.use(express.json())
app.use(cors());




