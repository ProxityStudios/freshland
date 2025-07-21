# Repick

Repick is a CLI tool that lets you clone repositories faster and comes with some additinional features such as E.P.A

## Usage

You can use Repick in two ways: with a single-line command or with a graphical user interface (GUI).

| Global Flag      | Description                |
| ---------------- | -------------------------- |
| `--d`, `--debug` | Enable debug mode          |
| `--gp`, `--global-proxy` | Globally sets the given proxy          |

### Single-line command

To clone a repository with a single-line command, use the following syntax:

```bash
npx repick@latest clone <SOURCE> <DESTINATION> [FLAGS]
```

For example, to clone `typescript-starter` repository from `ProxityStudios` into a directory named `myapp`, run:

```bash
npx repick@latest clone ProxityStudios/typescript-starter myapp
```

**<>** Required | **[]** Optional

| Flag                        | Referance          | Accepted Values              | Default Value      | Description                        |
| --------------------------- | ------------------ | ---------------------------- | ------------------ | ---------------------------------- |
| `--upd`, `--update-package` |                    |                              | `false`            | Update package name and version    |
| `--i`, `--install-deps`     | `<packageManager>` | `npm`, `pnpm`, `bun`, `yarn` | `do-not-install`   | Install dependencies automatically |

### Graphical user interface
TODO:

```bash
npx repick@latest gui
```

### [BETA] Init E.P.A and automatically configure it

E.P.A stands for **E**SLint, **P**rettier, and **A**irbnb. These are popular tools for code formatting and quality. Repick can install and configure them for you with a single command. Yeah, it's that simple.

#### TypeScript

If you're using TypeScript, you need to provide the `--ts` flag:

```bash
npx repick@latest init-epa <path/to/install> --ts
```

#### JavaScript

If you're using JavaScript, you don't need to do anything extra, just omit the `--ts` flag.

```bash
npx repick@latest init-epa <path/to/install>
```

| Flag                   | Description    |
| ---------------------- | -------------- |
| `--typescript`, `--ts` | Use TypeScript |

# Support and Feedback

If you have any questions, issues, or feedback related to Repick, create an issue through Github Issues!
