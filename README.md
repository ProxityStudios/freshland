# Freshland

Freshland is a cli tool to clone github repositories without the git history. *we're here to make things simpler and simpler for you guys. We promise*

## How Can I Use?

We support single-line/GUI commands that makes Freshland **easy-to-use**.

### Cloning with single-line command

```bash
npx freshland@latest clone proxitystudios/typescript-starter myapp
```

### Cloning with GUI command

```bash
npx freshland@latest
```

![With GUI](./docs/assets/with-gui.PNG 'With GUI')

### [BETA] Init E.P.A and automatically configure it

This script installs `eslint`, `prettier` & `airbnb` and automatically configures it. Yeah its that simple.


#### TypeScript

If you're using **TypeScript**, you should provide `--ts` flag

```bash
npx freshland@latest init-epa <path/to/install> --ts
```

#### JavaScript

You dont need to do anything extra, just don't use `--ts` flag. ~*try TypeScript man. It's not that hard*~

```bash
npx freshland@latest init-epa <path/to/install
```

| Flag              | Description    |
| ------------------ | -------------- |
| `--typescript`, `--ts` | Use typescript |
