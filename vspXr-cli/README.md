# vspXr-cli

This CLI is needed to upload extensions to the private extension registry server: [vspXr-Server](https://github.com/mamphis/vspXr/tree/master/vspXr-server)

## Installation

Install the vspXr-cli globally to use it everywhere.
```bash
$ npm i -g vspxr-cli
```

## Usage

You can use the cli directly in a vscode-extension directory. The cli will look for a `*.vsix` file in the current directory.

```bash
$ vspxr push
```

If you are not in a directory with an extension you can still publish it by entering the path to the vsix.

```
$ vspxr push ~/Downloads/mamphis.vspxr-extension-0.0.1.vsix
```

The default registry is configured in `~/.vspxr` and is defaulted to `http://localhost:3000`.

If you want to upload the extension to another registry you can change the registry with the`-r` tag.

```bash
$ vspxr push -r http://extension-server:8080
```

