import { Request, Response, NextFunction } from "express";
import { validaString } from "../helpers/utils";
import objeto from "../auth/index";
import jwt, { JwtPayload } from "jsonwebtoken";

export function middlewareTokenJWT(req: Request, res: Response, next: NextFunction) {

    try {
        const token: string = String(req.headers["authorization"]);

        if (!validaString(token))
            res.status(401).json({ erro: "Token não fornecido."});
        else {

            let tokenClean: string = "";

            if (token.indexOf("Bearer") > -1)
                tokenClean = token.replace("Bearer", "");

            const valido: Boolean = objeto.validaToken(tokenClean.trim(), "mundo-verde");

            if (!valido)
                res.status(401).json({ erro: "Token inválido ou expirado."});
            else {
                const idUsuario: JwtPayload = (jwt.decode(tokenClean.trim()) as JwtPayload);
                req.body.idUsuario = idUsuario?.sub;

                next();
            }
        }
    } catch {
        res.status(500).json({ erro: "Problemas ao validar token."});
    }
}