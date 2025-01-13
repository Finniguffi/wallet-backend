## Getting Started

### Prerequisites
- Docker
- Docker Compose
- Node.js
- Yarn

### Installation

1. Create a `.env` file in the root directory and add your environment variables:
  ```sh
  DB_ROOT_PASSWORD=your_root_password
  DB_DATABASE=your_database
  DB_USERNAME=your_username
  DB_PASSWORD=your_password
  ```

1. Build and start the Docker containers:
  ```sh
  docker-compose up --build
  ```

### Running Tests

To run tests, execute:
```sh
docker exec -it wallet_backend yarn test
```

### Stopping the Application

To stop the application, run:
```sh
docker-compose down
```

### Rebuilding the Application

To rebuild the application, run:
```sh
docker-compose up --build
```

### Accessing the Database

To access the MySQL database, run:
```sh
docker exec -it wallet_db mysql -u your_username -p
```

### Accessing Adminer

Adminer is available at [http://localhost:8080](http://localhost:8080)

### Additional Commands

- List running containers:
  ```sh
  docker ps
  ```

- Access the backend container:
  ```sh
  docker exec -it wallet_backend /bin/sh
  ```

- Access the database container:
  ```sh
  docker exec -it wallet_db /bin/sh
  ```


