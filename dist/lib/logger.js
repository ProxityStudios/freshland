"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const tslog_1 = require("tslog");
exports.logger = new tslog_1.Logger({
    type: 'pretty',
    prettyLogTemplate: '{{MM}}:{{ss}} {{logLevelName}} ',
});