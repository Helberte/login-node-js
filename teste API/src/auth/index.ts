import jwt from "jsonwebtoken";
import moment from "moment";
import { Payload } from "../auth/types";
import { criptografarToken, validaString } from "../helpers/utils";
import { User } from "../models/users";
import { createHmac }  from "node:crypto";
import ClientRedis from "../redis/connection";

class Token {

    public getToken() : string {

        if (Number(process.env.TOKEN_EXP) < 1)
            throw new Error("TOKEN_EXP não definido no server.");

        if (!validaString(process.env.APP_KEY || ""))
            throw new Error("Secret não definido no server.");

        const payload: Payload = {
            sub: "150",
            iss: "Mundo Verde",
            exp: moment().add(process.env.TOKEN_EXP, "minutes").unix(),
            iat: moment().unix(),
            aud: "mundo-verde"
        }

        return jwt.sign(payload, process.env.APP_KEY || "", { algorithm: "HS256" });
    }

    public getToken2(user: User) : string {

        if (Number(process.env.TOKEN_EXP) < 1)
            throw new Error("TOKEN_EXP não definido no server.");

        if (!validaString(process.env.APP_KEY || ""))
            throw new Error("Secret não definido no server.");

        let token: string = "";
        let tokenCriptografado: string = "";

        const payload: any = {
            sub: user.id,
            iss: "Mundo Verde",
            exp: moment().add(process.env.TOKEN_EXP, "minutes").unix(),
            iat: moment().unix(),
            aud: "mundo-verde"
        }

        token              = jwt.sign(payload, process.env.APP_KEY || "", { algorithm: "HS256" });
        tokenCriptografado = criptografarToken(token);

        return tokenCriptografado;
    }

    public async getRefreshToken(user: User): Promise<string> {

        if (Number(process.env.TOKEN_REFRESH) < 1)
            throw new Error("TOKEN_REFRESH não definido no server.");

        if (!validaString(process.env.APP_KEY || ""))
            throw new Error("Secret não definido no server.");

        let token: string = "";
        let tokenHash: string = "";
        let tokenCriptografado: string = "";

        const payload: any = {
            sub: user.id,
            iss: "mundo-verde-token-refresh",
            exp: moment().add(process.env.TOKEN_REFRESH, "minutes").unix(),
            iat: moment().unix(),
            aud: "token-refresh"
        }

        token     = jwt.sign(payload, process.env.APP_KEY || "", { algorithm: "HS256" });
        tokenHash = createHmac("sha512", process.env.APP_KEY!).update(token).digest("hex");

        const tokenUser = {
            userId: user.id,
            tokenHash: tokenHash
        }

        await ClientRedis.insereValor("tokenHash_" + String(user.id), JSON.stringify(tokenUser));

        tokenCriptografado = criptografarToken(token);
        return tokenCriptografado;
    }

    public validaToken(token: string, aud: string) : Boolean {

        if (!validaString(process.env.APP_KEY || ""))
            throw new Error("Secret não definido no server.");

        try {
            jwt.verify(token, process.env.APP_KEY || "", {
                audience: aud
            });
        } catch {
            return false;
        }
        return true;
    }

}

export default new Token();