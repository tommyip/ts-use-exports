export default function foo() {
    return "foo";
}

export function bar() {
    return foo() + "bar";
}
