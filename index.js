module.exports = {
    Object: require('./src/object'),
    Relation: require('./src/relation'),
    Type: require('./src/lib/type'),
    setup: ({objectPath, relationPath, removeSchemaUndefinedProperties = false}) => {
        require('./src/global').definitionDir.object = objectPath;
        require('./src/global').definitionDir.relation = relationPath;
        require('./src/global').removeSchemaUndefinedProperties = removeSchemaUndefinedProperties;
    }
};
