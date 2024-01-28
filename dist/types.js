"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageManager = exports.Check = void 0;
var Check;
(function (Check) {
    Check[Check["FILE"] = 0] = "FILE";
    Check[Check["VIDEO"] = 1] = "VIDEO";
    Check[Check["IMAGE"] = 2] = "IMAGE";
    Check[Check["DIRECTORY"] = 3] = "DIRECTORY";
})(Check || (exports.Check = Check = {}));
var PackageManager;
(function (PackageManager) {
    PackageManager["NPM"] = "npm";
    PackageManager["PNPM"] = "pnpm";
    PackageManager["YARN"] = "yarn";
    PackageManager["BUN"] = "bun";
})(PackageManager || (exports.PackageManager = PackageManager = {}));
