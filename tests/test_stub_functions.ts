import test from 'ava';
import sinon from 'sinon';

test('No compile errors', async t => {
    const mod = await import('./test_files/for_stubbing_simple');

    t.is(mod.bar(), "foobar");
});

test('Stub exported function', async t => {
    const mod = await import('./test_files/for_stubbing_simple');

    sinon.replace(mod, 'foo', sinon.fake.returns('replaced'));
    t.is(mod.bar(), "replacedbar");
});

test('Stub default exported function', async t => {
    const mod = await import('./test_files/for_stubbing_default_export');

    sinon.replace(mod, 'default', sinon.fake.returns('default'));
    t.is(mod.bar(), "defaultbar");
});

// Tracking issue: https://github.com/tommyip/ts-use-exports/issues/3
test.failing('Stub aliased exported function', async t => {
    const mod = await import('./test_files/for_stubbing_aliased');

    sinon.replace(mod, 'baz', sinon.fake.returns('baz'));
    t.is(mod.bar(), "bazbar");
});

test('Stub function exported with export statement', async t => {
    const mod = await import('./test_files/for_stubbing_export_statement');

    sinon.replace(mod, 'foo', sinon.fake.returns('replaced'));
    t.is(mod.bar(), "replacedbar");
});

test('Stub exported function expression', async t => {
    const mod = await import('./test_files/for_stubbing_non_function_declarations');

    sinon.replace(mod, 'foo', sinon.fake.returns('FOO'));
    sinon.replace(mod, 'baz', sinon.fake.returns('BAZ'));
    t.is(mod.bar(), "FOOBAZbar");
})
