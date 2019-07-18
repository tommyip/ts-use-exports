function foo() {
    return "foo";
}

function bar() {
    return foo() + "bar";
}

export { foo, bar };
