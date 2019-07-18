function foo() {
    return "actually baz";
}

export function bar() {
    return foo() + "bar";
}

export { foo as baz };
