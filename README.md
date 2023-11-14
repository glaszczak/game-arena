# Game-Arena

## Description

`Game-Arena` is an innovative platform designed for an abstract sports game experience. 

## Features
- `Local Database Integration` - Data is fetched from a locally hosted MySQL database, containing simulated data for an abstract sports game environment.
- `GraphQL API`: The API offers extensive querying capabilities, including:
  - Retrieving a list of matches.
  - Accessing a list of players.
  - Fetching a list of teams.
  - Obtaining a list of players for a specific team.
  - Getting teams associated with a specific player.
  - Listing teams and their players for a specific match.
  - Viewing match history for a specific player, including the teams they played for.

## Technologies
- `Backend`: Developed using NodeJS with the NestJS framework.
- `Database`: MySQL database, managed using Sequelize as the ORM.
- `GraphQL`: Implements a GraphQL server with a "code first" approach.

## Getting Started

### Installation

1. Clone the repository.
2. Install dependencies using `yarn`.
3. Configure your SQL database.

### Running the app

```bash
# development
$ yarn start

# watch mode
$ yarn start:dev
```
