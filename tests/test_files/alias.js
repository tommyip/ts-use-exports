"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function foo() {
    return "actually baz";
}
exports.baz = foo;
function bar() {
    return exports.foo() + "bar";
}
exports.bar = bar;
