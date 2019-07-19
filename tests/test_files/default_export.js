"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function foo() {
    return "foo";
}
exports.default = foo;
function bar() {
    return exports.default() + "bar";
}
exports.bar = bar;
