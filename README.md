[![Join our Discord](https://img.shields.io/discord/843939288349409331?label=Join%20Discord&logo=discord&logoColor=white)](https://discord.gg/wrhwwJQwas)

# Freshland

Freshland is a CLI tool that lets you clone GitHub repositories without the git history. _We're here to make things simpler and simpler for you. We promise._

## Usage

You can use Freshland in two ways: with a single-line command or with a graphical user interface (GUI).

| Global Flag      | Description                |
| ---------------- | -------------------------- |
| `--v`, `--vers`  | Output the current version |
| `--d`, `--debug` | Enable debug mode          |

### Single-line command

To clone a repository with a single-line command, use the following syntax:

```bash
npx freshland@latest clone <source-repo> <target-dir>
```

For example, to clone the `typescript-starter` repository from `ProxityStudios` into a directory named `myapp`, run:

```bash
npx freshland@latest clone ProxityStudios/typescript-starter myapp
```

**<>** Required | **[]** Optional

| Flag                        | Referance          | Accepted Values              | Default Value      | Description                        |
| --------------------------- | ------------------ | ---------------------------- | ------------------ | ---------------------------------- |
| `--upd`, `--update-package` |                    |                              | `false`            | Update package name and version    |
| `--n`, `--name`             | `<name>`           | `any-string eg: my-app`      | `cloned-repo-name` | Change the package name            |
| `--v`, `--version`          | `<version>`        | `any-version eg: 1.0.0`      | `1.0.0`            | Change the package version         |
| `--i`, `--install-deps`     | `<packageManager>` | `npm`, `pnpm`, `bun`, `yarn` | `do-not-install`   | Install dependencies automatically |
| `--kg`, `--keep-git`        |                    |                              | `false`            | Do not delete ".git" folder        |

### Graphical user interface

To clone a repository with a GUI, simply run:

```bash
npx freshland@latest
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

If you're using JavaScript, you don't need to do anything extra, just omit the `--ts` flag. ~_But seriously, give TypeScript a try. It's not that hard_~.

```bash
npx freshland@latest init-epa <path/to/install>
```

| Flag                   | Description    |
| ---------------------- | -------------- |
| `--typescript`, `--ts` | Use TypeScript |

# Support and Feedback

If you have any questions, issues, or feedback related to Freshland, we're here to help! Join our [Discord server](https://discord.gg/wrhwwJQwas) for support, discussions, and updates.
