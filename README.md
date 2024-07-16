# k4rally
### Prerequisites

1. **Node.js**
   - To install Node.js, please use the guide [here](https://nodejs.org/en/download/).
   
2. **Git**
   - Download Git from [here](https://git-scm.com/downloads).

3. **Hardhat**
   - A development environment for Ethereum software.

## Setup

1. Clone the repository from GitHub.
https://github.com/athinfosystems-sarthak/k4rally
2. Navigate to the folder where the repository was cloned.

### SmartContracts

1. Open the Terminal and go to /SmartContract and run the following command to install dependencies:
   ```bash
   npm install
2. In the file named .env add the following variables with their values

Variable	                                                      Description
PRIVATE_KEY	                                   Wallet private key
DEPLOYER_PRIVATE_KEY	                    The private key of the wallet for deployment
TOKEN_ADDRESS	                                 Deployed token address on the Polygon blockchain
TOKEN_NAME	                                 Set the ERC20 token name
TOKEN_SYMBOL	                                Set the ERC20 token symbol
MINT_MAX_LIMIT	                                Set the maximum limit for token minting
POLYGONSCAN_API_KEY                 	The API key provided by Polygons can
HARDCAP					Set the token hard cap limit
MONTHS					Set the number of months to vest the token
ADMIN_ADDRESS				Provide admin address
RECEIVER_ADDRESS		Provide the token receiver address for the initial mint
POLYGON_URL			Provide the Polygon URL


# Compile the Contracts
npx hardhat compile


# Test
**There are two test case files:**
Token.js
Vesting.js
**To run test cases, use the following command:**
npx hardhat test
# Deployment Scripts
**Scripts for deployment of smart contracts:**

tokenDeploy.js
vestingDeploy.js

npx hardhat run scripts/tokenDeploy.js
npx hardhat run scripts/vestingDeploy.js

# Verify
**To verify your implementation smart contract on the block explorer, run the following command:**
npx hardhat verify <Implementation contract address> --network <chain>


### Backend
All project dependencies are handled by Docker, so before starting the project, install Docker on your system.  
Reference: [Docker Installation Guide](https://docs.docker.com/engine/install/)

## Available Scripts

# Install Dependencies
To install all required dependencies before starting our backend:
```bash
npm install
```

# Start Containers in Development Mode
```
docker compose up -d
```

# Build and Start Containers in Development Mode
```
docker compose up -d --build --f
```
# Stop Containers Running in Development Mode
```
docker compose down
```

# Show Logs for the Backend-App Docker Container 
```
docker logs tokenMigration_backend_app -f
```


### Frontend

Node js handles all project dependencies, so install node js on your system before starting the project.  
For better understanding use this link  
Reference: https://react.dev/learn

## Available Scripts

# Install Dependencies 

To install all required dependencies before starting our frontend
In the project directory, you can run:
```
npm install
```


# Runs the app in the development mode: 
```
npm start
```
