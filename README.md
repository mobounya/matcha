# matcha

Note: each env file will need a copy of an enviroment variable if required.

MAIL_USERNAME=
MAIL_PASSWORD=
OAUTH_CLIENTID=
OAUTH_CLIENT_SECRET=
OAUTH_REFRESH_TOKEN=

## Env variables for app [.env.app.*]

| Name                  | Required | Type     | Default value | Scope      | Description                                     |
| --------------------- | -------- | -------- | ------------- | ---------- | ----------------------------------------------- |
| `POSTGRES_USER`       | true     | `string` | -             | pg         | Used to connect to the database service from pg |
| `POSTGRES_PASSWORD`   | true     | `string` | -             | pg         | Used to connect to the database service from pg |
| `POSTGRES_HOST`       | true     | `string` | -             | pg         | Used to connect to the database service from pg |
| `POSTGRES_DB`         | true     | `string` | -             | pg         | Used to connect to the database service from pg |
| `POSTGRES_PORT`       | true     | `number` | -             | pg         | Used to connect to the database service from pg |
| `MAIL_USERNAME`       | true     | `string` | -             | nodemailer | used to send emails with gmail in nodemailer    |
| `MAIL_PASSWORD`       | true     | `string` | -             | nodemailer | used to send emails with gmail in nodemailer    |
| `OAUTH_CLIENTID`      | true     | `string` | -             | nodemailer | used to send emails with gmail in nodemailer    |
| `OAUTH_CLIENT_SECRET` | true     | `string` | -             | nodemailer | used to send emails with gmail in nodemailer    |
| `OAUTH_REFRESH_TOKEN` | true     | `string` | -             | nodemailer | used to send emails with gmail in nodemailer    |

## Env variables for database [.env.db.*]

| Name                | Required | Type     | Default value | Description       |
| ------------------- | -------- | -------- | ------------- | ----------------- |
| `POSTGRES_USER`     | true     | `string` | -             | postgres username |
| `POSTGRES_PASSWORD` | true     | `string` | -             | postgres password |
| `POSTGRES_DB`       | true     | `string` | -             | postgres database |

## Documentation:

You can find the documentation for this api here [[Documentation]](https://app.swaggerhub.com/apis-docs/amine.bounya20/matcha/1.0.0#/)

## Getting Started

run the development server:

```bash
docker-compose up
```

## Branch namings

```
prefix-branch_name

prefixes
- feat: (new feature)
- fix: (bug fix)
- doc: (changes to the documentation)
- style: (formatting, missing semi colons, etc)
- refactor: (refactoring code, eg. renaming a variable)

Example
feat-signin
```

## Commits

Try to do verbose atomic commits, ideally each commit will address a single change, if there's more than one change in a commit,
format the commit message like this:

```
- First change
- second change
...
```

Don't be afraid to give too many details in a commit message, an over detailed commit message is better than a under detailed one.
