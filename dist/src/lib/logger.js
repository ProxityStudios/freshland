"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainLogger = void 0;
const tslog_1 = require("tslog");
exports.mainLogger = new tslog_1.Logger({ type: 'pretty', name: 'CLI' });
