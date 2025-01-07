const
  persist = require('@fua/module.persistence'),
  dfc = require('@fua/module.dfc'),
  context = require('../data/context.json'),
  factory = new persist.TermFactory(context),
  dataParser = new dfc.JSONTransformer({
    id: 'countries-parser'
  }),
  rowParser = new dfc.Transformer('countries-parser');

dataParser.use(function (source, output, next) {
  output.dataset = new persist.Dataset(null, factory);
  output.dataset.add(factory.quad(
    factory.namedNode(context.fua_nation),
    factory.namedNode(context.rdf + 'type'),
    factory.namedNode(context.ldp + 'Container')
  ));
  next();
});

dataParser.use(async function (source, output, next) {
  try {
    for (let feature of output.features) {
      if (!feature.properties) continue;
      if (!feature.properties['iso_a2']) continue;
      if (feature.properties['iso_a2'] === '-99') continue;
      const rowParam = {
        Identifier: feature.properties['iso_a2'],
        ISO_3166_1: feature.properties['iso_a2'],
        FrenchName: feature.properties['formal_fr'],
        EnglishName: feature.properties['formal_en'],
        Geometry: feature.geometry?.coordinates ? feature.geometry : null
      };
      await rowParser(rowParam, output.dataset);
    }
    next();
  } catch (err) {
    next(err);
  }
});

dataParser.use(function (source, output, next) {
  next(null, output.dataset);
});

rowParser.use(function (source, output, next) {
  output.add(factory.quad(
    factory.namedNode(context.fua_nation + source.Identifier),
    factory.namedNode(context.rdf + 'type'),
    factory.namedNode(context.ldp + 'RDFSource')
  ));
  next();
});

rowParser.use(function (source, output, next) {
  output.add(factory.quad(
    factory.namedNode(context.fua_nation),
    factory.namedNode(context.ldp + 'contains'),
    factory.namedNode(context.fua_nation + source.Identifier)
  ));
  next();
});

rowParser.use(function (source, output, next) {
  if (source.EnglishName) output.add(factory.quad(
    factory.namedNode(context.fua_nation + source.Identifier),
    factory.namedNode(context.rdfs + 'label'),
    factory.literal(source.EnglishName, 'en')
  ));
  next();
});

rowParser.use(function (source, output, next) {
  if (source.FrenchName) output.add(factory.quad(
    factory.namedNode(context.fua_nation + source.Identifier),
    factory.namedNode(context.rdfs + 'label'),
    factory.literal(source.FrenchName, 'fr')
  ));
  next();
});

rowParser.use(function (source, output, next) {
  if (source.Geometry) {
    const geometry_node = factory.blankNode();
    output.add(factory.quad(
      factory.namedNode(context.fua_nation + source.Identifier),
      factory.namedNode(context.geojson + 'geometry'),
      geometry_node
    ));
    output.add(factory.quad(
      geometry_node,
      factory.namedNode(context.rdf + 'type'),
      factory.namedNode(context.geojson + source.Geometry.type)
    ));
    output.add(factory.quad(
      geometry_node,
      factory.namedNode(context.geojson + 'type'),
      factory.literal(source.Geometry.type)
    ));
    output.add(factory.quad(
      geometry_node,
      factory.namedNode(context.geojson + 'coordinates'),
      factory.literal(JSON.stringify(source.Geometry.coordinates))
    ));
  }
  next();
});

rowParser.lock();
module.exports = dataParser.lock();
