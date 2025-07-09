# Freshland

Freshland is a CLI tool that lets you clone repositories faster and comes with some additinional features such as E.P.A

## Usage

You can use Freshland in two ways: with a single-line command or with a graphical user interface (GUI).

| Global Flag      | Description                |
| ---------------- | -------------------------- |
| `--v`, `--version`  | Output the current version |
| `--d`, `--debug` | Enable debug mode          |

### Single-line command

To clone a repository with a single-line command, use the following syntax:

```bash
npx freshland@latest clone <SOURCE> <DESTINATION> [FLAGS]
```

For example, to clone `typescript-starter` repository from `ProxityStudios` into a directory named `myapp`, run:

```bash
npx freshland@latest clone ProxityStudios/typescript-starter myapp
```

**<>** Required | **[]** Optional

| Flag                        | Referance          | Accepted Values              | Default Value      | Description                        |
| --------------------------- | ------------------ | ---------------------------- | ------------------ | ---------------------------------- |
| `--upd`, `--update-package` |                    |                              | `false`            | Update package name and version    |
| `--n`, `--name`             | `<name>`           | `string`      | `cloned-repo-name` | Change the package name.           |
| `--v`, `--version`          | `<version>`        | `x.x.x`      | `1.0.0`            | Change the package version         |
| `--i`, `--install-deps`     | `<packageManager>` | `npm`, `pnpm`, `bun`, `yarn` | `do-not-install`   | Install dependencies automatically |
| `--kg`, `--keep-git`        |                    |                              | `false`            | Do not delete ".git" folder        |

### Graphical user interface

To clone a repository with a GUI, simply run:

```bash
npx freshland@latest gui
```

You will see a prompt like this:

![With GUI](./docs/assets/with-gui.PNG 'With GUI')

### [BETA] Init E.P.A and automatically configure it

E.P.A stands for **E**SLint, **P**rettier, and **A**irbnb. These are popular tools for code formatting and quality. Freshland can install and configure them for you with a single command. Yeah, it's that simple.

#### TypeScript

If you're using TypeScript, you need to provide the `--ts` flag:

```bash
npx freshland@latest init-epa <path/to/install> --ts
```

#### JavaScript

If you're using JavaScript, you don't need to do anything extra, just omit the `--ts` flag.

```bash
npx freshland@latest init-epa <path/to/install>
```

| Flag                   | Description    |
| ---------------------- | -------------- |
| `--typescript`, `--ts` | Use TypeScript |

# Support and Feedback

If you have any questions, issues, or feedback related to Freshland, create an issue through Github Issues!
