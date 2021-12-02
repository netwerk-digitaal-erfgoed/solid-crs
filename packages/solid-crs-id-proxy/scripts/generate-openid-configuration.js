const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const args = process.argv.slice(2);
let upstreamUrl = args[0];
if (!upstreamUrl.endsWith('/')) upstreamUrl += '/';
const proxyUrl = args[1];
const filePath = args[2] ?? 'assets/openid-configuration.json';

const fetchOpenidConfig = async (url) => {

  const response = await fetch(url);

  return response.json();

};

if (args.length < 2) {

  console.log('Please provide both an upstream url and proxy url');

} else {

  fetchOpenidConfig(upstreamUrl + '.well-known/openid-configuration').then((data) => {

    for (const key of Object.keys(data)) {

      if (typeof data[key] === 'string'){

        // replace all instances of the upstream url with the proxy url
        data[key] = data[key].replace(upstreamUrl, proxyUrl);

      }
    }

    data.solid_oidc_supported = 'https://solidproject.org/TR/solid-oidc';

    // add grant_types_supported claim if it's not there. Should be accepted as authorization_code by default, but inrupt sdk specifically looks for it. Remove when fixed by inrupt.
    if (!data.grant_types_supported) data.grant_types_supported = 'authorization_code';

    fs.writeFileSync(path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath), JSON.stringify(data));

    console.log(`Successfully wrote the config to "${path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)}"`);

  });

}
