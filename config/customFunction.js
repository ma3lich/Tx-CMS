const fs = require("fs");
var ip = require("ip");

module.exports = {
  isUserAuthenticated: (req, res, next) => {
    if (req.isAuthenticated()) next();
    else res.redirect("/");
  },

  serverIP: ip.address(),

  jsonReader: (filePath, cb) => {
    fs.readFile(filePath, (err, fileData) => {
      if (err) return cb && cb(err);
      try {
        return cb && cb(null, object);
      } catch (err) {
        return cb && cb(err);
      }
    });
  },
};
