"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function foo() { }
exports.foo = foo;
{
    // Make sure no false positive here
    var foo_2 = [];
    for (var _i = 0, foo_1 = foo_2; _i < foo_1.length; _i++) {
        var _ = foo_1[_i];
    }
}
{
    var _ = exports.foo;
}
