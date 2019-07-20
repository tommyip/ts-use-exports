import { createWrappedNode, ts } from 'ts-morph';

type PosToIdMap = Map<number, { name: string, isDefault: boolean, defPos: number }>;
type FnToPosMap = Map<string, number>;

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
    const moduleTarget = program.getCompilerOptions().module;
    const { ES3, ES5 } = ts.ScriptTarget;

    if ((moduleTarget === undefined && (moduleTarget === ES3 || moduleTarget === ES5)) ||
        moduleTarget === ts.ModuleKind.CommonJS)
    {
        return (ctx: ts.TransformationContext) => (file: ts.SourceFile) => {
            const typeChecker = program.getTypeChecker();
            const wrappedFile = createWrappedNode(file, { typeChecker });

            // 1. Aggregate exported function names
            const functions = wrappedFile.getFunctions();
            let defaultExport = '';
            const exports: FnToPosMap = new Map();
            for (const fn of functions) {
                if (fn.isExported()) {
                    const name = fn.getName();
                    if (fn.isDefaultExport()) {
                        // If a function is default exported without a name,
                        // it cannot be referenced locally anyway.
                        if (name === undefined) continue;
                        defaultExport = name;
                    }
                    exports.set(name as string, fn.getStart()); // Only default export can be nameless
                }
            }

            // 2. Aggregate function references to be modified.
            const postToId: PosToIdMap = new Map();
            const ids = wrappedFile.getDescendantsOfKind(ts.SyntaxKind.Identifier);
            for (const id of ids) {
                if (exports.has(id.getText())) {
                    if (id.getParentIfKind(ts.SyntaxKind.FunctionDeclaration)) continue;
                    if (id.getParentIfKind(ts.SyntaxKind.ExportSpecifier)) continue;
                    if (id.getParentIfKind(ts.SyntaxKind.ExportAssignment)) continue;

                    postToId.set(id.getStart(), {
                        name: id.getText(),
                        isDefault: id.getText() === defaultExport,
                        defPos: exports.get(id.getText()) as number,
                    });
                }
            }

            if (!exports) {
                return file;
            }

            // 3. Change the references
            return visitNodeAndChildren(file, postToId, typeChecker, ctx);
        };
    }

    throw new Error('Module target is not CommonJS');
}

function visitNodeAndChildren(node: ts.SourceFile, posToId: PosToIdMap, typeChecker: ts.TypeChecker, ctx: ts.TransformationContext): ts.SourceFile;
function visitNodeAndChildren(node: ts.Node, posToId: PosToIdMap, typeChecker: ts.TypeChecker, ctx: ts.TransformationContext): ts.Node;
function visitNodeAndChildren(node: ts.Node, posToId: PosToIdMap, typeChecker: ts.TypeChecker, ctx: ts.TransformationContext): ts.Node {
    return ts.visitEachChild(
        visitNode(node, posToId, typeChecker),
        childNode => visitNodeAndChildren(childNode, posToId, typeChecker, ctx),
        ctx);
}

function visitNode(node: ts.Node, idMap: PosToIdMap, typeChecker: ts.TypeChecker): ts.Node {
    if (ts.isIdentifier(node)) {
        const id = idMap.get(node.getStart());
        if (id && id.name === node.getText()) {
            const symbol = typeChecker.getSymbolAtLocation(node);
            if (symbol && symbol.valueDeclaration.getStart() === id.defPos) {
                idMap.delete(node.getStart());
                const fnName = id.isDefault ? 'default' : id.name;
                // Not using ts.createPropertyAccess() since that triggers a
                // weird error.
                return ts.createIdentifier('exports.' + fnName);
            }
        }
    }
    return node;
}
