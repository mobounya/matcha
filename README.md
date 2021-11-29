# matcha

## Env variables

| Name          | Required | Type      | Default value | Description                            |
| ------------- | -------- | --------- | ------------- | -------------------------------------- |
| `APP_PORT`    | true     | `integer` | -             | Port that express will be listening on |
| `DB_USER`     | true     | `string`  | -             |                                        |
| `DB_PASSWORD` | true     | `string`  | -             |                                        |

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

Don't be scared to give too many details in a commit message, an over detailed commit message is better than a under detailed one.
