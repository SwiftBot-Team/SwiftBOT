"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chalk_1 = require("chalk");
const TEXT = chalk_1.supportsColor
    ? chalk_1.reset.inverse.bold.redBright(` ERROR `)
    : ' ERROR ';
class InternalError extends Error {
    constructor(message) {
        super(message);
        this.name = TEXT;
    }
}
exports.default = InternalError;
