import express, { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import objeto from "../auth/index";
import validate from "validate.js";
import { middlewareTokenJWT } from "../auth/middlewares";

const router: Router = express.Router();

router.use(middlewareTokenJWT);

router.get("/valida-token/:token", (req: Request, res: Response) => {
    try {

        if (validate.isEmpty(req.params.token))
            throw new Error("Parametro token necessário.");

        const valido: Boolean = objeto.validaToken(req.params.token, "mundo-verde");

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

export default router;