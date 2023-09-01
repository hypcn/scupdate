
# Scupdate

Update all NPM packages with a given scope

## Usage

All packages in the `package.json` file in the current working directory that have the given scope are updated.

Optionally install the package, or run using `npx`:

```bash
$ npm i -g scupdate
$ scupdate myscope
# or
$ npx scupdate myscope
```

Run the command with or without the "@" package scope prefix:

```bash
$ npx scupdate myscope
# or
$ npx scupdate @myscope
```

Flags:

- `-f` Force updates to packages (use `npm i <@scope/package>@latest` instead of the default `npm update <@scope/package>`)
- `-g` Update packages installed globally, instead of those in the current directory


