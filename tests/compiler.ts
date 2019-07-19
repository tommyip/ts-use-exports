import { ts } from 'ts-morph';
import tsUseExports from '../transformer';

export function compile(filePaths: string[], writeFile: ts.WriteFileCallback): void {
    const program = ts.createProgram(filePaths, {
        noEmitOnError: true,
        target: ts.ScriptTarget.ES5,
        module: ts.ModuleKind.CommonJS,
    });

    const transformers = {
        before: [tsUseExports(program)],
        after: [],
    };

    const { emitSkipped, diagnostics } = program.emit(
        undefined, writeFile, undefined, false, transformers);

    if (emitSkipped) {
        throw new Error(diagnostics.map(diagnostics => diagnostics.messageText).join('\n'));
    }
}
