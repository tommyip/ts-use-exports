export function foo() {}

{
    // Make sure no false positive here
    const foo = [];
    for (const _ of foo) { }
}

{
    const _ = foo;
}
