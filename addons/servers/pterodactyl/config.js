const Nodeactyl = require("nodeactyl");


module.exports = {
    Application : new Nodeactyl.NodeactylApplication(
        "https://panel.txhost.fr",
        "ptla_nm9keWWAnHOaAM2EKVtiRhoXNqTz3Hmr8e4E5v7PqGC"
    ),

    Client : new Nodeactyl.NodeactylClient(
        "https://panel.txhost.fr",
        "ptlc_XBGDCNGtKCt49rWQ0c4SGhEHic3HBOfCK83ou36ykgB"
    ),
}