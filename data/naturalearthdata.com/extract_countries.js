const
    {join: joinPath} = require('path'),
    {promisify}      = require('util'),
    Fs               = require('fs'),
    readFile         = promisify(Fs.readFile),
    writeFile        = promisify(Fs.writeFile),
    input_file       = 'ne_110m_admin_0_countries.geo.json',
    output_folder    = 'countries-110m',
    key_property     = 'ADMIN';

console.time("DONE");
loadNaturalEarth(input_file)
    .then(collection => Promise.all(collection.features.map(saveCountry)))
    .then(() => console.timeEnd("DONE"))
    .catch(console.error);

async function loadNaturalEarth(file) {
    const buffer = await readFile(joinPath(__dirname, file));
    return JSON.parse(buffer.toString());
} // loadNaturalEarth

async function saveCountry(feature) {
    const buffer = Buffer.from(JSON.stringify(feature, null, "\t"));
    const file   = `${feature.properties[key_property].replace(/\W+/g, "_")}.geojson`;
    await writeFile(joinPath(__dirname, output_folder, file), buffer);
} // saveCountry
