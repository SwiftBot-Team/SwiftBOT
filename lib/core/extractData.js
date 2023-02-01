"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml_1 = require("yaml");
const InternalError_1 = require("./errors/InternalError");
function extractData(file, dir) {
    const $dir = dir.split('/')[dir.split('/').length - 1];
    const language = $dir.split('.')[1];
    if (language === 'json') {
        return JSON.parse(file.toString());
    }
    if (language === 'yml' || language === 'yaml') {
        return yaml_1.default.parse(file.toString());
    }
    throw new InternalError_1.default('The file extension must be YAML or JSON');
}
exports.default = extractData;
