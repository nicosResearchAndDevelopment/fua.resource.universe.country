const
  persist = require('@fua/module.persistence'),
  dfc = require('@fua/module.dfc'),
  context = require('../data/context.json'),
  factory = new persist.TermFactory(context),
  dataParser = new dfc.CSVTransformer({
    id: 'countries-parser',
    headers: true,
    trim: true
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
    for (let row of output.rows) {
      if (!row['ISO3166-1-Alpha-2']) continue;
      const rowParam = {
        Identifier: row['ISO3166-1-Alpha-2'],
        ISO_3166_1: row['ISO3166-1-Alpha-2'],
        FrenchName: row['official_name_fr'],
        EnglishName: row['official_name_en']
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

rowParser.lock();
module.exports = dataParser.lock();
