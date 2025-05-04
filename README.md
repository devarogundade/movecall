# Documentation

## Using the token bridge.

## Building a cross-chain dApp (Message bridge).

## Running a validator's node.

#### Requirements

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
