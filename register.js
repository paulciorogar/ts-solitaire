/* eslint-disable semi */

const tsAutoMockTransformer = require('ts-auto-mock/transformer').default
const tsNode = require('ts-node')
require('./test-tsconfig.json')

// overrides tsconfig used for the app
tsNode.register({
    files: true,
    project: './test-tsconfig.json',
    transformers: program => ({
        before: [
            tsAutoMockTransformer(program)
        ]
    })
})