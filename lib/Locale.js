"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
const fs_1 = require("fs");
const events_1 = require("events");
const InternalError_1 = require("./core/errors/InternalError");
const extractData_1 = require("./core/extractData");
const debug_1 = require("./core/debug");
class Locale extends events_1.EventEmitter {
    constructor(dir, options) {
        super();
        this.dir = dir;
        this.languages = {};
        this.actualLang = options.defaultLanguage;
        this.options = options;
        debug_1.default(this);
    }
    async init() {
        this.emit('init');
        const dirs = glob_1.sync(this.dir + '/**/*.*');
        return new Promise(async (pass) => {
            for (const file of dirs) {
                const data = fs_1.readFileSync(file);
                const split = file.split('/');
                const lang = split[split.length - 2];
                const $data = await extractData_1.default(data, file);
                typeof this.languages[lang] === 'undefined'
                    ? this.languages[lang] = {}
                    : null;
                this.languages[lang][split[split.length - 1].split('.')[0]] = $data;
            }
            this.emit('initFinished', dirs.length);
            pass(true)
        });
    }
    async setLang(lang) {
        if (!this.languages[lang]) {
            this.emit('error');
            throw new InternalError_1.default('This language does not exist or not been loaded.');
        }
        this.actualLang = lang;

        this.emit('languageChanged', ({ $lang: lang, newLang: this.actualLang }));
    }
    t(locale, options) {
        if (!this.languages[this.actualLang]) {
            this.emit('error');
            throw new InternalError_1.default('The actual language does not exist or not been loaded.');
        }
        const props = locale.split(':');
        let res = this.languages[this.actualLang];
        for (const prop of props) {
            if (prop.includes('.')) {
                for (const $prop of prop.split('.')) {
                    if (res !== undefined)
                        res = res[$prop];
                    else {
                        if (!this.options.returnUndefined)
                            return 'No locale available';
                        else
                            return undefined;
                    }
                }
            }
            else {
                if (res !== undefined)
                    res = res[prop];
                else {
                    if (!this.options.returnUndefined)
                        return 'No locale available';
                    else
                        return undefined;
                }
            }
        }
        if (!this.options.returnUndefined && res == undefined) {
            return 'No locale available';
        }
        else {
            return this.format(res, options);
        }
    }

    format(locale, options) {
        let response = locale;
        if (typeof options == 'object') {

            const vars = response.match(/{{([a-z]|[.]|[0-9])+}}/gi);
            if (!vars) return response;

            vars.map(i => {

                const split = i.replace(/{{|}}+/gi, '').split('.');

                if (options[split[0]] === undefined) return i;


                let result = options[split[0]];

                for (let i = 1; i < split.length; i++) {
                    result = result[split[i]]
                }

                response = response.replace(i, result)
            })
        }
        return response;
    }
}
module.exports = Locale;