# ConfMod: A Simple Modeling of Confidentiality Requirements for Inter-Organizational Data Sharing

## About

The present work is currently under submission.
This repository contains preliminary information and will be fully populated at a later point in time.

## License

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.

If you are planning to integrate parts of our work into a commercial product and do not want to disclose your source code, please contact us for other licensing options via email at pennekamp (at) comsys (dot) rwth-aachen (dot) de

## Acknowledgments

Funded by the Deutsche Forschungsgemeinschaft (DFG, German Research Foundation) under Germany's Excellence Strategy – EXC-2023 Internet of Production – 390621612.

---

## Quickstart

The quickest way to get the application running is by using
[docker](https://www.docker.com/).

Open a shell at the root of the repository and run
```sh
$ docker compose up --build
```

This starts a web server with the application listening on port 8080.
You can now opan a web browser and navigate to http://localhost:8080/.

Hint: Once the containers have been built, the `--build` flag can be omitted.

## Example Data

We provide example data that corresponds to the information presented in the paper (see directory `example/`).
More information will follow once the paper has been accepted.

## Development

This repository consists of three subprojects. A library and an application are made up of a backend and a frontend part.
The library and application backend are implemented in [Python](https://www.python.org/) while the application frontend is written in [Typescript](https://www.typescriptlang.org/) (Strongly typed Javascript).

The Python codebases require the [python interpreter](https://www.python.org/).
Furthermore, they use [poetry](https://python-poetry.org/) for dependency management.
The Javscript frontend requires [Nodejs](https://nodejs.org/en) and npm (included with Nodejs installation) for development.

### libconfmod

A Python library that implements the ConfMod core functionality.

#### Requirements
* Python3.12
* pip
* poetry

#### Getting Started

To get started with the project, please conduct the following steps:

* Install Python3.12, pip, and poetry.
* Navigate to `confmod/` as your working directory.
* Create a virtual environment for the project. `poetry env use` can be used for this.
* Use `poetry shell` to spawn a shell with an active virtual environment for the library project.
* Run `poetry install` to download and install the project dependencies.

Congratulations, you are now set and can start working on the codebase.

#### Building

To build the library, ensure the current working directory is at `confmod/` and the virtual environment is active.

The project is built using poetry:
```sh
$ poetry build
```

### ConfMod Backend

The ConfMod backend uses libConfMod and the [FastAPI](https://fastapi.tiangolo.com/) framework to
provide a web api that is consumed by the frontend to provide a visual
configuration.

#### Requirements
* Python3.12
* pip
* poetry

#### Getting started

To get started with the project, please conduct the following steps:

* Ensure Python3.12, pip, and poetry are installed
* Build the library (see above instructions on how to build)
* Navigate to `confmod-app/backend` as your working directory.
* Create a virtual environment for the project. `poetry env use` can be used for this.
* Use `poetry shell` to spawn a shell with an active virtual environment for the library project.
* Run `poetry install` to download and install the project dependencies.

Congratulations, you are now set and can start working on the codebase.

#### Running in development mode

To execute the web server set `confmod-app/backend/` as the working directory, spawn a shell with your virtual environment (e.g., using `poetry shell`), and run the following command
```sh
$ poetry run main.py
```

By default, the app is served at port `8080`, and the API is accessible from the URL path `/api`.

### ConfMod Frontend

The frontend is a single-page application that connects to the backend server to provide a website as a visual interface where one can configure the confModels.

#### Getting started

* Ensure Nodejs is installed. If you do not have Nodejs and are unsure which version to install, choose the latest LTS version.
* In a terminal, navigate to `confmod-app/frontend`
* Install project dependencies with `npm install`.

#### Running in Development Mode

To run the frontend, ensure the backend server is running (see above for necessary steps).
Then, a local development server for the frontend can be started with
```sh
$ npm run start
```
This server has the nice feature that it automatically restarts whenever you change one of the frontend's source files.

#### Typings Provided by OpenAPI

Using FastAPI as the backend server comes with
[OpenAPI](https://www.openapis.org/) specifications out of the box, allowing the automatic generation of typings and a client for the web API served by the backend.
Whenever the API of the backend changes, the typings and the client must be re-generated using the openapi-generator.
The package.json contains a prebuild command for convenience, which can be run with:
```sh
npm run generate-openapi-client
```
Hint: if the backend does not use the default configuration, the URL after the
`-i` parameter needs to be changed accordingly

### Building

The code of the frontend can be bundled into a set of files that a regular web server like nginx can serve statically.
This step is achieved using the `build` script from the package.json.
```sh
npm run build
```

## Configuration

This section describes how the application can be configured.

### Backend

The backend can be configured via environment variables. All the variables below can optionally be prefixed with `CONFMOD_`.

* `PORT`: The network port where the API server listens (default: 8080).
* `LISTEN_ADDR`: The host address where the server listens. Use `0.0.0.0` to listen on all interfaces (default: `0.0.0.0`).
* `LOG_LEVEL`: Defines how verbose the logging is (default: `INFO`).
* `API_BASE_URL`: URL prefix from where the API will be served (default: `/api`).

#### Using a .env file
All the above variables can be set by using a .env file in the `confmod-app/backend` directory, where each line in the file contains a pair of the form `VARIABLE=value`.


## Docker deployment
For simple deployment, there is a docker-compose file that sets up and orchestrates two containers.

1. A Python web server that provides the application backend (Dockerfile: backend.Dockerfile).
2. A nginx web server that serves the static files of the frontend and proxies api requests to the backend server (Dockerfile: confmod-app/frontend/Dockerfile)

To build the containers, run `docker-compose build` from the repository's root directory.

To create the containers and start them run `docker-compose up`.

If the containers have been started and one wants to reuse them, simply execute `docker-compose start`.
WARNING: Rebuilding the containers will result in loss of data!

### Containers

#### Backend
The container runs a FastAPI web server that provides the ConfMod web API.
In the default configuration, it is not exposed to the host but proxied to an
nginx web server.

##### Properties

Image Properties:
* Dockerfile: `backend.Dockerfile`
* Build Context: `.` (root of repository)
* Ports: 8080
* Entrypoint: `[ "poetry", "run", "main.py" ]`
* Env Variables: *none*
* Workdir: `/confmod/app`

Container Properties:
* Ports mapped to Host: *none*,
* Bind Mounts: *none*

##### Configuration
Configuration is possible via environment variables as given in the Section *Configuration*.

#### Nginx
A web server that served the static files of the frontend and proxies calls to
the backend API. By default only this web server is accessible from the host.

##### Properties

Image Properties:
* Dockerfile: `confmod-app/frontend/Dockerfile`
* Build Context: `./confmod-app/frontend`
* Ports: 8080
* Entrypoint: *same as nginx base image*
* Env Variables: *none*
* Workdir: `/confmod/app`

Container Properties:
* Ports mapped to Host:
    * Container: `8080`
    * Host: `8080`
* Bind Mounts:
    * Container: `/etc/nginx/conf.d/app-confmod.conf`
    * Host: `./confmod-app/frontend/nginx/app-confmod.conf`

##### Configuration
The nginx configuration can be changed via the configuration in
`confmod-app/frontend/nginx/app-confmod.conf`.
If more sophisticated changes to the nginx configuration need to be made, one
can provide a custom nginx.conf and mount it at `/etc/nginx/nginx.conf`.

Please note that there are some common issues if you override the default
configuration. Please refer to the documentation of the used [nginx
image](https://hub.docker.com/r/nginxinc/nginx-unprivileged).
