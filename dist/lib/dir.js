"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rootDir = void 0;
const node_path_1 = __importDefault(require("node:path"));
// eslint-disable-next-line unicorn/prefer-module
exports.rootDir = node_path_1.default.resolve(__dirname, '..', '..');
