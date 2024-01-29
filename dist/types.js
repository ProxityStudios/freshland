"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PackageManagerEnum = exports.Check = void 0;
var Check;
(function (Check) {
    Check[Check["FILE"] = 0] = "FILE";
    Check[Check["VIDEO"] = 1] = "VIDEO";
    Check[Check["IMAGE"] = 2] = "IMAGE";
    Check[Check["DIRECTORY"] = 3] = "DIRECTORY";
})(Check || (exports.Check = Check = {}));
var PackageManagerEnum;
(function (PackageManagerEnum) {
    PackageManagerEnum["npm"] = "npm";
    PackageManagerEnum["pnpm"] = "pnpm";
    PackageManagerEnum["yarn"] = "yarn";
    PackageManagerEnum["bun"] = "bun";
})(PackageManagerEnum || (exports.PackageManagerEnum = PackageManagerEnum = {}));
