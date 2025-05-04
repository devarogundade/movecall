# Documentation

## Using the token bridge.

Visit [https://movecall.netlify.app](https://movecall.netlify.app)

## Building a cross-chain dApp (Message bridge).

### IOTA (Testnet Chain ID ~ 0)

#### Sending message.

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

#### Receiving message. (Paused)

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

#### Sending message.

```solidity
function sendMessage(
    uint64 toChain,
    bytes32 to,
    bytes memory payload
) external payable returns (bytes32 uid);
```

#### Receiving message.

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
