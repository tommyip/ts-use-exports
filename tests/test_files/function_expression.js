"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.foo = function () {
    return "foo";
};
exports.baz = function baz() {
    return "baz";
};
function bar() {
    return exports.foo() + exports.baz() + "bar";
}
exports.bar = bar;
