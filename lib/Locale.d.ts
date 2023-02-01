/// <reference types="node" />
import { EventEmitter } from 'events';
interface Options {
    returnUndefined?: boolean;
    defaultLanguage: string;
    debug?: boolean;
}
export default class Locale extends EventEmitter {
    private dir;
    private languages;
    actualLang: string;
    options: Options;
    constructor(dir: string, options: Options);
    init(): Promise<unknown>;
    setLang(lang: string): Promise<void>;
    t(locale: string, options?: {}): string | undefined;
    format(locale: string, options?: object): string;
}
export {};
