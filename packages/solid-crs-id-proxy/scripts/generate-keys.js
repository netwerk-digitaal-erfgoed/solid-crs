const fs = require('fs');
const path = require('path');
const jose = require('jose');
const { v4: uuid } = require('uuid');
const args = process.argv.slice(2);
const filePath = args[0] ?? '../../assets/jwks.json';

const generateKeys = async () => {

  const rsaKey =  await jose.generateKeyPair('RS256');
  const rsaJwk = await jose.exportJWK(rsaKey.privateKey);
  rsaJwk.kid = uuid();
  rsaJwk.alg = 'RS256';
  rsaJwk.use = 'sig';

  const jwks = {
    'keys': [
      rsaJwk,
    ],
  };

  fs.writeFileSync(path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath), JSON.stringify(jwks));

  console.log(`Successfully wrote the keys to "${path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath)}"`);

};

generateKeys();
