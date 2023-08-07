module.exports = {
    '@context':        'fua.load.rdf',
    'dct:identifier':  __filename,
    'dct:format':      'application/fua.load+js',
    'dct:title':       'load',
    'dct:alternative': '@nrd/fua.resource.universe.country',
    'dct:requires':    [{
        'dct:identifier': '../data/countries.ttl',
        'dct:format':     'text/turtle'
    }]
};
