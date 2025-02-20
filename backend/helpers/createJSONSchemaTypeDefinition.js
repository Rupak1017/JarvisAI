export function createJSONSchemaTypeDefinition(schema) {
    return {
        type: "object",
        properties: schema,
        required: Object.keys(schema),
    };
}
