/* eslint-disable semi */

const tsNode = require('ts-node')
require('./test-tsconfig.json')

// overrides tsconfig used for the app
tsNode.register({
    files: true,
    project: './test-tsconfig.json'
})