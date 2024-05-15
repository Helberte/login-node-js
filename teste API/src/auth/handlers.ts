import { createHmac }  from "node:crypto";
import {
    NextFunction,
    Request,
    Response,
    Router
} from "express";
import jwt from "jsonwebtoken";
import { User, users } from "../models/users";
import { descriptografarToken, validaString } from "../helpers/utils";
import tokenIndex from "../auth/index";
import { Payload } from "./types";
import ClassRedis from "../redis/connection";

interface ExtendeResponse    extends Response<any, { userId: number; token: string }> {}
// interface ExtendeResponse    extends Response<any, { user: Partial<User>; refreshHash: string }> {}
// interface AccessTokenPayload extends JwtPayload, Omit<User, "username" | "password"> {}

const router = Router();

// middleware que verifica se o token refresh existe na requisição, valida e gera o hash
const withRefreshAuth = async (req: Request, res: ExtendeResponse, next: NextFunction) => {

    let token: string = "";
    let tokenCriptografado: string | any = req.cookies["refresh-token"];

    if (!validaString(tokenCriptografado))
        return res.status(401).json( { erro: "Falta o refresh token no cookie." } );

    token = descriptografarToken(tokenCriptografado);

    const tokenHash: string = createHmac("sha512", process.env.APP_KEY!).update(token).digest("hex");

    await ClassRedis.obtemValorChave("tokenHash_" + jwt.decode(token)?.sub)
    .then(result => {
        if (String(JSON.parse(result).tokenHash) == tokenHash) {

            try {
                tokenIndex.validaToken(token, "token-refresh");
            } catch (error) {
                return res.status(401).json( { erro: (error as Error).message } );
            }

            res.locals.token = token;
            next();
        }
        else {
            return res.status(401).json( { erro: "sessão inválida." } );
        }
    })
    .catch(_err => {
        return res.status(401).json( { erro: "sessão inválida." } );
    });
}

const withAcessAuth = (req: Request, res: ExtendeResponse, next: NextFunction) => {

    const token: string = String(req.headers["authorization"]);

    if (!validaString(token))
        return res.status(401).json({ erro: "Token não fornecido."});

    try {
        const tokenValido: Boolean = tokenIndex.validaToken(token, "mundo-verde")

        if (!tokenValido) return res.status(401).json( { erro: "Token inválido ou expirado." } );

        const infoToken: Payload = jwt.decode(token) as Payload;

        res.locals.userId = Number(infoToken.sub);
        next();

    } catch (error) {
        return res.status(401).json( { erro: (error as Error).message } );
    }
};

// seta o cookie com o token refresh no front-end
const setRefreshCookie = (res: ExtendeResponse, token: string) => {
    res.cookie("refresh-token", token, {
        httpOnly: true,                                                               // Impede que o token seja acessível pelo JS
        secure: false,                                                                // Impede o uso do cookie fora de ambientes HTTPS
        sameSite: "strict",                                                           // Os cookies só podem ser usados no mesmo domínio
        expires: new Date(Date.now() + Number(process.env.TOKEN_REFRESH) * 60 * 1000) // Data de expiração do token
    })
};

router.post("/login-token-refresh", async (req: Request, res: ExtendeResponse) => {
    const { username, password } = req.body;

    if (!validaString(username) || !validaString(password))
        return res.status(500).json( { erro: "Faltam informações." } );

    const user: User | undefined = users.find(x => x.username == username && x.password == password)

    if (!user)
        return res.status(401).json( { erro: "Usuário não autorizado!" } )

    let accessToken: string = "";
    let refreshToken: string = "";

    accessToken = tokenIndex.getToken2(user);

    await tokenIndex.getRefreshToken(user)
    .then(result => {
        refreshToken = result;

        setRefreshCookie(res, refreshToken);
    })
    .catch(err => {
        throw new Error("Erro ao gravar hashToken: " + (err as Error).message);
    });

    res.status(200).json( { access: accessToken } );
});

router.post("/refresh", withRefreshAuth, async (_req: Request, res: ExtendeResponse) => {
    const userId: number = Number(jwt.decode(res.locals.token)?.sub);

    const user: User | undefined = users.find(x => x.id == userId);

    if (!userId || !user)
        return res.status(403).json( { erro: "Usuário não encontrado!" } );

    let refreshToken: string = "";
    let acessToken: string   = tokenIndex.getToken2(user);

    await tokenIndex.getRefreshToken(user)
    .then(result => {
        refreshToken = result;

        setRefreshCookie(res, refreshToken);

        res.status(200).json( { access: acessToken } );
    })
    .catch(err => {
        throw new Error("Erro ao gravar hashToken: " + (err as Error).message);
    });
});

router.get("/users/:username", withAcessAuth, (req: Request, res: ExtendeResponse) => {

    const user: User | undefined = users.find(x => x.username == req.params.username);

    if (!user)
        return res.status(500).json( { erro: "Usuario não encontrado." } )

    res.status(200).json( user );
});

router.get("/", (_req: Request, res: ExtendeResponse) => {

    res.status(200).json( { mensagem: "Funcionando!" } );
});


export default router;