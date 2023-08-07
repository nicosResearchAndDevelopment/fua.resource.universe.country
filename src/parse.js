const
    util       = require('@nrd/fua.core.util'),
    path       = require('path'),
    fs         = require('fs/promises'),
    rdf        = require('@nrd/fua.module.rdf'),
    // dataParser = require('./parser.js'),
    // inputFile  = path.join(__dirname, '../data/countries.csv'),
    dataParser = require('./parser.geo.js'),
    inputFile  = path.join(__dirname, '../data/geojson-maps.ash.ms/countries.low_res.geo.json'),
    outputFile = path.join(__dirname, '../data/countries.ttl');

fs.readFile(inputFile, 'utf-8')
    .then(dataParser)
    .then(dataset => rdf.serializeDataset(dataset, 'text/turtle'))
    .then(output => fs.writeFile(outputFile, output))
    .then(util.logDone)
    .catch(util.logError);
