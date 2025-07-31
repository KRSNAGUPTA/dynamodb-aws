import express from "express";
import cors from "cors";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    PutCommand,
    ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { configDotenv } from "dotenv";
configDotenv()

const app = express();
app.use(cors(
    {
        origin: "*"
    }
));
app.use(express.json());
app.use(express.urlencoded({extended:true}))
const client = new DynamoDBClient({
    region: "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const ddb = DynamoDBDocumentClient.from(client);

app.get("/", (req, res) => {
    return res.status(200).json({
        message: "API is working"
    })
})


app.post("/add-product", async (req, res) => {
    if (!req.body) {
        return res.status(400).json({
            message: "Req body is empty"
        })
    }
    const { ProductId, Name, ExpiryInMin } = req.body;
    const ExpiryDate = Math.floor(Date.now() / 1000 + ExpiryInMin * 60);

    if (!ProductId || !Name || !ExpiryInMin) {
        return res.status(400).json({
            message: "Some details are missing"
        })
    }
    try {
        await ddb.send(
            new PutCommand({
                TableName: "Inventory",
                Item: { ProductId, Name, ExpiryDate },
            })
        );
        res.json({ message: "Product added!" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/products", async (req, res) => {
    try {
        const data = await ddb.send(new ScanCommand({ TableName: "Inventory" }));
        // console.log(data)
        return res.json({
            message: "fetched data",
            items:data.Items
        })
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
})
