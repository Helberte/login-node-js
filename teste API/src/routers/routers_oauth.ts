import express, { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import objeto from "../auth/index";
import validade from "validate.js";

const router: Router = express.Router();

router.post("/login", (req: Request, res: Response) => {
    try {

        const { user, password } = req.body;

        if (validade.isEmpty(user))
            throw new Error("Falta o parãmetro usuário!");

        if (validade.isEmpty(password))
            throw new Error("Falta o parãmetro senha!");

        const usuario: string = String(user);
        const senha:   Number = Number(password);

        if (usuario != "Helberte" || senha != 12345678)
            throw new Error("Usuário ou senha incorretos");

        const token: string = objeto.getToken();

        res.status(200).json({
            mensagem: "sucesso!",
            token,
            validade: process.env.TOKEN_EXP + " Minutos",
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

export default router;