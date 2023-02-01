"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const log_symbols_1 = require("log-symbols");
const prefix = chalk_1.reset.inverse.bold.yellowBright(` DEBUG `);
exports.default = (Loc) => {
    if (Loc.options.debug) {
        Loc.on('error', () => {
            console.log(`${prefix} ${chalk_1.gray('[error]')} ${log_symbols_1.error} An error occurred`);
        });
        Loc.on('init', () => {
            console.log(`${prefix} ${chalk_1.gray('[info]')} ${log_symbols_1.info} Starting translate system...`);
            Loc.on('initFinished', (dirs) => {
                console.log(`${prefix} ${chalk_1.gray('[info]')} ${log_symbols_1.success} A total of ${dirs} files was loaded`);
            });
        });
        Loc.on('languageChanged', ({ $lang, newLang }) => {
            console.log(`${prefix} ${chalk_1.gray('[language]')} ${log_symbols_1.success} The language was changed [${$lang} -> ${newLang}]`);
        });
    }
};
