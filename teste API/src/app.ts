import express from "express";
import router_oauth from "./routers/routers_oauth";
import handlers from "./auth/handlers";
import router_consultas from "./routers/routers_consultas";
import cookie_parser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";

const app  = express();
const port = 4500;

/*
app.all("*", (_req, _res, next) => {
    console.log("Executa tudo que tem pra executar, e depois chama" +
        "next() para o fluxo continuar na rota especificada.");

    next();
})

app.get("/oauth/token", (_req, res) => {
    try {

        const token: string = objeto.getToken();

        res.status(200).json({
            mensagem: "sucesso!",
            token,
            validade: "2 Minutos",
            info: jwt.decode(token,
            {
                complete: true
            }),
            appKey: process.env.APP_KEY
        });

    } catch (e) {
        res.status(500).json( { erro: (e as Error).message } );
    }
})


app.get("/oauth/valida-token/:token", (req, res) => {
    try {

        if (validate.isEmpty(req.params.token))
            throw new Error("Parametro token necessário.");

        const valido: Boolean = objeto.validaToken(req.params.token);

        res.status(200).json({
            valido,
            info: jwt.decode(req.params.token,
            {
                complete: true
            }),
            token: req.params.token
        });

    } catch (e) {
        res.status(500).json( { erro: (e as Error).message } );
    }
})

app.post("/oauth/rota-post", (req, res) => {

    console.log(req.query);

    res.status(200).json({ req: req.body })
});
*/

app.use(cookie_parser());
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: "http://localhost:5500"
}));

app.use("/oauth", router_oauth);
app.use("/consultas", router_consultas);
app.use("/teste-autenticacao", handlers);

dotenv.config();


app.listen(port, () => {
    console.log("Servidor levantado porta: " + port);
})