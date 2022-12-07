const fs = require("fs");
const os = require("os");
const path = require("path");

const envFilePath = path.resolve(__dirname, ".env");
const readEnvVars = () => fs.readFileSync(envFilePath, "utf-8").split(os.EOL);

module.exports = {
    getEnVvalue: (key) => {
        const matchedLine = readEnvVars().find((line) => line.split("=")[0] === key);
        const variable = matchedLine.split("=")
        const variableName = variable.shift()
        return matchedLine !== undefined ? variable.join("").replace(`"`, "").replace(`"`, ""): null;
    },

    setEnvValue: (key, value) => {
        const envVars = readEnvVars();
        const targetLine = envVars.find((line) => line.split("=")[0] === key);
        if (targetLine !== undefined) {
            const targetLineIndex = envVars.indexOf(targetLine);
            envVars.splice(targetLineIndex, 1, `${key}="${value}"`);
        } else {
            envVars.push(`${key}="${value}"`);
        }
        fs.writeFileSync(envFilePath, envVars.join(os.EOL));
    },
}