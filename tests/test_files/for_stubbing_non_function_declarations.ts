export const foo = function () {
    return "foo";
};

export const baz = function baz() {
    return "baz";
}

export function bar() {
    return foo() + baz() + "bar";
}
