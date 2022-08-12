const fs = require('fs').promises;
const path = require('path');
const os = require('os');

const Logger = {
    logToFile: async (data) => {
        try {
            const desktopDir = path.join(os.homedir(), "Desktop");
            await fs.appendFile(path.join(desktopDir, 'phones.csv'), data + '\r\n', 'utf8');
        } catch (error) {
            console.log(error);
        }
    },
    logErrorToFile: async (data) => {
        try {
            const desktopDir = path.join(os.homedir(), "Desktop");
            await fs.appendFile(path.join(desktopDir, 'errors.csv'), data + '\r\n', 'utf8');
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = Logger;