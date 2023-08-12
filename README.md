# hardhat-sync-selectors

Hardhat plugin to sync selectors/signatures with various open registries.

## Installation

```bash
yarn add hardhat-sync-selectors
```

Import the plugin in your `hardhat.config.js`:

```js
require("hardhat-sync-selectors");
```

Or if you are using TypeScript, in your `hardhat.config.ts`:

```ts
import "hardhat-sync-selectors";
```

## Tasks

This plugin adds the following tasks to Hardhat:

1. `sync-selectors`
2. `sync-signatures`

Both tasks are exactly the same and upload signatures from all your contracts.

```bash
yarn hardhat sync-selectors
```
