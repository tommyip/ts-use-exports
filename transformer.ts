import ts from 'typescript';

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
    const moduleTarget = program.getCompilerOptions().module;
    const { ES3, ES5 } = ts.ScriptTarget;

    if ((moduleTarget === undefined && (moduleTarget === ES3 || moduleTarget === ES5)) ||
        moduleTarget === ts.ModuleKind.CommonJS)
    {
        return (context: ts.TransformationContext) => {
            return (file: ts.SourceFile) => visitNodeAndChildren(file, program, context);
        };
    }

    throw new Error('Module target is not CommonJS');
}

function visitNodeAndChildren(node: ts.SourceFile, program: ts.Program, ctx: ts.TransformationContext): ts.SourceFile;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, ctx: ts.TransformationContext): ts.Node;
function visitNodeAndChildren(node: ts.Node, program: ts.Program, ctx: ts.TransformationContext): ts.Node {
    return ts.visitEachChild(
        visitNode(node, program),
        childNode => visitNodeAndChildren(childNode, program, ctx),
        ctx);
}

function visitNode(node: ts.Node, program: ts.Program): ts.Node {
    const typeChecker = program.getTypeChecker();

    if (ts.isIdentifier(node)) {
        const symbol = typeChecker.getSymbolAtLocation(node);
        // Check that the identifier is a function name but not part of
        // the function header itself.
        if (symbol &&
            !ts.isExportSpecifier(node.parent) &&
            !ts.isFunctionDeclaration(node.parent) &&
            ts.isFunctionDeclaration(symbol.valueDeclaration))
        {
            const fnDeclaration = symbol.valueDeclaration;
            if (isExportDeclaration(fnDeclaration)) {
                const fnName = isDefaultExport(fnDeclaration) ? 'default' : symbol.getName();

                return ts.createPropertyAccess(
                    ts.createIdentifier('exports'), fnName);
            }
        }
    }
    return node;
}

function isExportDeclaration(node: ts.Declaration): node is ts.ExportDeclaration {
    const flags = ts.getCombinedModifierFlags(node);
    return (flags & ts.ModifierFlags.Export) === ts.ModifierFlags.Export;
}

function isDefaultExport(node: ts.Declaration): boolean {
    const flags = ts.getCombinedModifierFlags(node);
    return flags === ts.ModifierFlags.ExportDefault;
}
