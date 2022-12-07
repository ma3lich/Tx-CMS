const WebSocket = require("ws");
const txws = new WebSocket.Server({ port: 2005 });

module.exports = {
    GetWebSocket: (server) => {
        const pteroWS = new WebSocket(server.console.socket, {
            origin: "https://panel.txhost.fr",
        });

        txws.on("connection", (ws) => {

            pteroWS.on(`open`, () => {
                ws.send("\033[95m[TxCMS]\033[39m Connexion réussite ! \n\r");
                pteroWS.send(
                    JSON.stringify({ event: "auth", args: [server.console.token] })
                );
                pteroWS.send(JSON.stringify({ event: "send logs", args: [null] }));
                pteroWS.send(JSON.stringify({ event: "send stats", args: [null] }));

                pteroWS.on("message", function incoming(msg) {
                    msg = JSON.parse(msg.toString());
                    if (msg.event.includes("console")) {
                        let outpout;
                        outpout = !!msg.args ? msg.args.join(" ") : "";
                        ws.send(outpout);
                    }
                    if (msg.event.includes("stats")) {
                        ws.send(JSON.stringify(msg.args));
                    }

                    if (msg.event.includes("token expiring")) {
                        console.log(JSON.stringify(msg.args));
                    }

                    if (msg.event.includes("token expired")) {
                        pteroWS.send(
                            JSON.stringify({ event: "auth", args: [server.console.token] })
                        );
                    }
                });

                ws.on("message", function incoming(msg) {
                    const message = JSON.parse(msg.toString());

                    if (message.event.includes("set state")) {
                        let state = JSON.stringify(message.args)
                            .replace('["', "")
                            .replace('"]', "");
                        pteroWS.send(JSON.stringify({ event: "set state", args: [state] }));
                    }

                    if (message.event.includes("send command")) {
                        let commande = JSON.stringify(message.args)
                            .replace('["', "")
                            .replace('"]', "");
                        pteroWS.send(
                            JSON.stringify({ event: "send command", args: [commande] })
                        );
                    }
                });
            });
            pteroWS.on("error", function connection(err) {
                console.error(err);
            });
        });
    },
};
