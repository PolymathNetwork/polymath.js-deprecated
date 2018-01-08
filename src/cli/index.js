import path from 'path';

import fs from 'fs-extra';
import Web3 from 'web3';
import yargs from 'yargs';

function hashSource(source) {
  return Web3.prototype.sha3(source);
}

async function copyArtifact(filePath) {
  const contents = await fs.readFile(filePath);
  const originalJSON = JSON.parse(contents);
  const newJSON = {
    contractName: originalJSON.contractName,
    abi: originalJSON.abi,
    networks: originalJSON.networks,
    bytecode: originalJSON.bytecode,
  };
  newJSON.sourceHash = hashSource(originalJSON.source);

  const destDir = path.join('src', 'artifacts');

  await fs.ensureDir(destDir);

  const basename = path.basename(filePath);
  const destPath = path.join(destDir, basename);

  try {
    const stat = await fs.lstat(destPath);

    if (stat.isFile()) {
      const destContents = await fs.readFile(destPath);

      try {
        const destJSON = JSON.parse(destContents);

        if (destJSON.sourceHash === newJSON.sourceHash) {
          destJSON.networks = {
            ...destJSON.networks,
            ...newJSON.networks,
          };
          await fs.writeFile(destPath, JSON.stringify(destJSON, null, 2));
          return;
        }
      } catch (err) {
        if (!(err instanceof SyntaxError)) {
          throw err;
        }
      }
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      throw err;
    }
  }

  await fs.writeFile(destPath, JSON.stringify(newJSON, null, 2));
}

async function copyArtifacts(/* argv */) {
  const toCopy = [
    'PolyToken',
    'Customers',
    'Compliance',
    'SecurityToken',
    'SecurityTokenRegistrar',
    'STOContract',
    'Template',
  ];

  for (let i = 0; i < toCopy.length; i++) {
    const name = toCopy[i];
    const filePath = path.join('build', 'contracts', `${name}.json`);

    try {
      const stat = await fs.stat(filePath);

      if (!stat.isFile()) {
        throw new Error(`"${filePath}"" is not a file.`);
      }

      await copyArtifact(filePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        throw new Error(`Could not find contract artifact "${filePath}".`);
      }

      throw err;
    }
  }
}

// eslint-disable-next-line no-unused-expressions
yargs
  .command(
    'copyartifacts',
    'Copy and simplify contract artifacts into src/artifacts',
    // eslint-disable-next-line no-shadow
    yargs => yargs,
    copyArtifacts,
  )
  .demandCommand()
  .help().argv;
