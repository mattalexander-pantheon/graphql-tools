import { extendSchema, buildASTSchema, GraphQLSchema, DocumentNode } from 'graphql';

import { ITypeDefinitions, GraphQLParseOptions, parseGraphQLSDL } from '@graphql-tools/utils';

import { filterAndExtractExtensionDefinitions } from './extensionDefinitions';
import { concatenateTypeDefs } from './concatenateTypeDefs';

export function buildSchemaFromTypeDefinitions(
  typeDefinitions: ITypeDefinitions,
  parseOptions?: GraphQLParseOptions,
  noExtensionExtraction?: boolean
): GraphQLSchema {
  const document = buildDocumentFromTypeDefinitions(typeDefinitions, parseOptions);

  if (noExtensionExtraction) {
    return buildASTSchema(document);
  }

  const { typesAst, extensionsAst } = filterAndExtractExtensionDefinitions(document);

  const backcompatOptions = { commentDescriptions: true };
  let schema: GraphQLSchema = buildASTSchema(typesAst, backcompatOptions);

  if (extensionsAst.definitions.length > 0) {
    schema = extendSchema(schema, extensionsAst, backcompatOptions);
  }

  return schema;
}

export function buildDocumentFromTypeDefinitions(
  typeDefinitions: ITypeDefinitions,
  parseOptions?: GraphQLParseOptions
): DocumentNode {
  return parseGraphQLSDL('', concatenateTypeDefs(typeDefinitions), parseOptions).document;
}
