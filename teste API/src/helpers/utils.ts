import {
    createCipheriv,
    scryptSync,
    createDecipheriv,
    Cipher,
    Decipher } from "node:crypto";

export function validaString(valor: string) : Boolean {
    try {
        if (valor) {
            if (valor == undefined || valor.toLowerCase() == "undefined" || valor == "" || valor == null || valor.toLowerCase() == "null")
                return false;
            return true;
        }
        return false;
    } catch {
        return false;
    }
}

export function criptografarToken(token: string): string {
    const key: Buffer      = scryptSync(String(process.env.CRYPTO_PASSWORD), 'salt', 24);
    let iv                 = Buffer.alloc(16, 0);

    const encrypt: Cipher  = createCipheriv('aes-192-cbc', key, iv);
    let encriptado: string = encrypt.update(token, 'utf8', 'base64');
    encriptado            += encrypt.final('base64');

    return encriptado;
}

export function descriptografarToken(encriptado: string): string {
    const key: Buffer     = scryptSync(String(process.env.CRYPTO_PASSWORD), 'salt', 24);
    const iv: Buffer      = Buffer.alloc(16, 0);

    var decry: Decipher   = createDecipheriv('aes-192-cbc', key, iv);

    let decrypted: string = decry.update(encriptado, 'base64', 'utf8');
    decrypted += decry.final('utf8');

    return decrypted;
}