const refreshIntervalMinutes = 1 * 60 * 1000; // 1 minuto

const tokenSymbol   = Symbol.for("acessToken");
const internalToken = new Proxy({ [tokenSymbol]: null }, {
    get(target, prop) {
        const primitive = Reflect.get(target, tokenSymbol);
        const value = primitive[prop];
        return typeof value == "function" ? value.bind(primitive) : value;
    },
    set (target, _, value) {
        document.querySelector("#rawToken").innerHTML = value;

        return Reflect.set(target, tokenSymbol, value);
    }
} );

function updateMessage(message, selector = ".login-result") {
    const infoBox = document.querySelector(selector);
    infoBox.innerHTML = message;

    infoBox.style.display = "flex";
}

async function refreshToken() {
    updateMessage("Validando Token.");

    await fetch("http://localhost:4500/teste-autenticacao/refresh", {
        method: "POST",
        credentials: "include"
    })
    .then((result) => result.json())
    .then(({ access }) => {
        internalToken[tokenSymbol] = access;

        updateMessage(`Próximo tokem em: ${ new Date(Date.now() + refreshIntervalMinutes).toLocaleTimeString()}`);
    })
}

document.getElementById("formLoginDados").addEventListener("submit", async (e) => {
    e.preventDefault();
    updateMessage("Logging in ...");

    const form = new FormData(e.target);
    const data = Object.fromEntries(form.entries());

    await fetch("http://localhost:4500/teste-autenticacao/login-token-refresh", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        credentials: "include",
        body: JSON.stringify(data)

    }).then(async result => {
        updateMessage(result.ok ? `Login Sucesso!` : `Usuário ou senha não encontrados: ${result.status}`);

        if (!result.ok) {
            document.querySelector("#rawToken").innerHTML     = "";
            document.querySelector("#decodedToken").innerHTML = "";
        }

        if (result.status == 200) {
            const response = await result.json();

            internalToken[tokenSymbol] = response.access;

            setInterval(refreshToken, refreshIntervalMinutes);
        }
    }).catch(erro => {
        updateMessage(`Login Falhou com status: ${erro}`);
    });
});