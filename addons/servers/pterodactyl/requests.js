const db = require("../../../config/database");
const { Application, Client } = require("./config")
const { timeSince, getFileExtension } = require("../../../config/customFunction");


module.exports = {
  getPterodactylNodes: (callback) => {
    Application.getNodePage().then((response) => {
      let nodes = [];
      response.forEach((node) => {
        nodes.push({
          id: node.attributes.id,
          name: node.attributes.name,
          fqdn: node.attributes.fqdn,
          memory: node.attributes.memory,
          disk: node.attributes.disk,
        });
      });
      return callback(nodes);
    });
  },

  getPterodactylNests: (callback) => {
    Application.getAllNests().then((response) => {
      return callback(response);
    })
  },

  getPterodactylEggsByNestID: (nest, callback) => {
    Application.getAllEggs(nest).then((result) => {
      return callback(result);
    });
  },



  GetPterodactylServerInfo: (serviceID, userID, callback) => {
    db.query(
      `SELECT * FROM services WHERE owner = ${userID} AND id = ${serviceID} `,
      function (err, data) {
        if (data.length > 0) {
          let server = [];

          Client.getServerDetails(data[0].serverID).then((details) => {
            Client.getConsoleWebSocket(data[0].serverID).then((socket) => {
              server.push({
                name: details.name,
                id: details.identifier,
                uuid: details.uuid,
                node: details.node,
                ip: details.sftp_details.ip,
                port: details.sftp_details.port,
                console: socket,
              });

              return callback(server[0]);
            });
          });
        } else {
          return callback(false);
        }
      }
    );
  },

  GetFilesAndDirectorys: (server, directory, callback) => {
    let files = [];
    let directorys = [];
    if (directory) {
      Client.getServerFiles(server.id, directory).then((response) => {
        response.forEach((file) => {
          if (file.attributes.mimetype == "inode/directory") {
            directorys.push({
              name: file.attributes.name,
              size: file.attributes.size,
              type: "Dossier",
              modified_at: timeSince(
                new Date(file.attributes.modified_at)
              ),
              in_folder: directory,
            });
          } else {
            files.push({
              name: file.attributes.name,
              size: file.attributes.size,
              type: getFileExtension(file.attributes.name),
              modified_at: timeSince(
                new Date(file.attributes.modified_at)
              ),
              in_folder: directory,
            });
          }
        });
        return callback(
          directorys,
          files,
          directory,
        );
      });
    } else {
      Client.getServerFiles(server.id, "").then((response) => {
        response.forEach((file) => {
          if (file.attributes.mimetype == "inode/directory") {
            directorys.push({
              name: file.attributes.name,
              size: file.attributes.size,
              type: "Dossier",
              modified_at: timeSince(new Date(file.attributes.modified_at)),
            });
          } else {
            files.push({
              name: file.attributes.name,
              size: file.attributes.size,
              type: getFileExtension(file.attributes.name),
              modified_at: timeSince(new Date(file.attributes.modified_at)),
            });
          }
        });
        return callback(
          directorys,
          files,
          directory,
        );
      });
    }
  },

  GetFileContent: (server, file, callback) => {
    Client.getFileContent(server.id, file).then((code) => {
      return callback(code)
    })
  },
};
