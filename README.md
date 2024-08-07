# MEV Bot

![MEV Bot](banner.png "MEV Bot")

This project is a Minimal Extractable Value (MEV) bot that listens for pending transactions on the Ethereum mainnet, forks the mainnet using Hardhat, tests the transactions on the forked network, and submits profitable transactions back to the mainnet.

## Features

- Subscribes to the Ethereum mainnet for pending transactions using Infura.
- Forks the mainnet using Hardhat for each detected pending transaction.
- Simulates the transaction on the forked network to check for profitability.
- Submits profitable transactions back to the mainnet.

## Requirements

- Node.js (v20 or higher)
- npm (v6 or higher)
- Infura Project ID

## Installation

1. Clone the repository:
```sh
git clone git@github.com:kiknaio/MEV-demo.git
cd MEV-demo
```

2. Install the dependencies:
  ```sh
  npm install
  ```

3. Configure your Infura Project ID:
- Create a `.env` file in the root directory of the project.
- Add your Infura Project ID to the `.env` file:
  ```
  INFURA_API_KEY=your_infura_project_id
  ```

## Usage

1. Start the MEV bot:
```sh
npx hardhat run scripts/mev-bot.js
```
