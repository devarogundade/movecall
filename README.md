# Documentation

MoveCall is an advanced interoperability protocol built on the IOTA blockchain, enabling cross-chain token transfers and arbitrary message passing with high scalability and efficiency. 

MoveCall introduces two core pipelines:
- **Token Bridge** – for seamless asset transfers between IOTA and other blockchain ecosystems.
- **Message Bridge** – for sending arbitrary data and commands across chains.

**Security Layer**

MoveCall is secured through economic staking, where validators must either:
- Stake native IOTA coins, or
- Restake IOTA Liquid Staked Tokens (LSTs)

## Frontend

```
cd ui
```

```env
VITE_PROJECT_ID=
VITE_HOLESKY_EXPLORER_URL=
VITE_IOTA_EXPLORER_URL=
VITE_OPENAI_KEY=
VITE_FS_API_KEY=
VITE_FS_AUTH_DOMAIN=
VITE_FS_PROJECT_ID=
VITE_FS_STORAGE_BUCKET=
VITE_FS_MSG_SENDER_ID=
VITE_FS_APP_ID=
VITE_FS_MEASUREMENT_ID=
```

```
npm run dev
```

## Using the token bridge.

Visit [https://movecall.netlify.app](https://movecall.netlify.app)

## Building a cross-chain dApp (Message bridge).

### IOTA (Testnet Chain ID ~ 0)

#### Sending message from IOTA.

```move
public entry fun send_message(
    bridge: &mut MessageBridge,
    coin_fee: coin::Coin<IOTA>,
    to_chain: u64,
    to: vector<u8>,
    payload: vector<u8>,
    ctx: &mut TxContext
): vector<u8>
```

#### Receiving message on IOTA. (Paused)

```move
public entry fun move_call_message(
    _: &MoveCallCap,
    source_chain: u64,
    from: vector<u8>,
    payload: vector<u8>,
    ...                // Other params
    ctx: &mut TxContext
) {
    // YOUR LOGIC HERE
}
```

### EVM (Holeskey Chain ID ~ 17000)

#### Sending message from EVM.

```solidity
function sendMessage(
    uint64 toChain,
    bytes32 to,
    bytes memory payload
) external payable returns (bytes32 uid);
```

#### Receiving message on EVM.

```solidity
function moveCallMessage(
    uint64 sourceChain,
    bytes32 from,
    bytes memory payload
) external override onlyMoveCall {
    // YOUR LOGIC HERE
}
```

## Running a validator's node.

#### Requirements

- Docker.
- Secret key of the EOA with required staked position.

#### docker-compose.yml

```yml
version: "3.8"

services:
  app:
    image: devarogundade/movecall-validator:latest
    container_name: my_validator_node
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - NODE_URL=
      - SECRET_KEY=
    command: npx nodemon src/index.ts
```

#### start container

```
docker compose -f 'validator\docker-compose.yml' up -d --build
```
