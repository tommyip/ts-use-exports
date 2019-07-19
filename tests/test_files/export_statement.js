"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function foo() {
    return "foo";
}
exports.foo = foo;
function bar() {
    return exports.foo() + "bar";
}
exports.bar = bar;
