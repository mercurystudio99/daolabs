# Readme

## Quick Start

### Install and build cloud-functions

```sh
  yarn func:install && yarn func:build
```

### Starting emulators

```sh
  yarn emulators:start
```

### Export env variables

Open another terminal and export the env variables.

```sh
export FIREBASE_STORAGE_EMULATOR_HOST="localhost:9199"
```

```sh
export FIREBASE_AUTH_EMULATOR_HOST="localhost:9099"
```

```sh
export FIREBASE_DATABASE_EMULATOR_HOST="localhost:9000"
```

```sh
export GCLOUD_PROJECT="your-project-id"
```

**"your-project-id"** see in file _.firebaserc_.

### Migrate test data

Go to functions folder.

```sh
  cd functions
```

And run the migration command.

```sh
  npm run test:migrate
```

### Command overview and examples

Make sure you are in the functions folder!

#### All projects

Returns a list of all projects and a list of builds.

```sh
  cloud-test a
```

OR

```sh
  cloud-test all-projects
```

#### Generations

Image generation.

**"projectID"** see from the command above.

```sh
  cloud-test g "projectID"
```

OR

```sh
  cloud-test generation "projectID"
```

#### Collages

Collages generation.

**"projectID"** see from the command _all-projects_.

**"build-name"** see the _all-projects_ command or the output in the command above.

```sh
  cloud-test c "project-id" "build-name"
```

OR

```sh
  cloud-test collages "project-id" "build-name"
```

#### Metadata

Metadata generation and upload.

**"projectID"** see from the command _all-projects_.

**"build-name"** see the _all-projects_ command or the output in the command above.

```sh
  cloud-test m "project-id" "build-name"
```

OR

```sh
  cloud-test metadata "project-id" "build-name"
```

#### Animation

Animation generation.

**"projectID"** see from the command _all-projects_.

```sh
  cloud-test animation "project-id"
```
