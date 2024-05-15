import { createClient } from 'redis';

export default class ClassRedis {

    private static async start(): Promise<ReturnType<typeof createClient>> {
        const client: ReturnType<typeof createClient> = await createClient()
        .on(
            'error',
            err => {
                throw new Error(`houve um erro ao se conectar com o redis. ${err}`);
            })
        .connect();

        return client;
    }

    public static async insereValor(chave: string, valor: string): Promise<void> {

        const client = await this.start();
        const expiracao: number = Number(process.env.TOKEN_REFRESH) * 60;

        await client.set(chave, valor, { EX: expiracao} );

        await client.disconnect();
    }

    public static async obtemValorChave(chave: string): Promise<string> {
        const client = await this.start();

        const valor: string = await client.get(chave) as string;

        await client.disconnect();

        return valor;
    }
}





