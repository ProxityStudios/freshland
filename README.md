# Freshland

A tool that clones the repos easily

## Usage

### Clone a repo without using gui

```bash
npx freshland@latest clone proxitystudios/typescript-starter myapp
```

### Clone a repo with using gui

```bash
npx freshland@latest
```

![With GUI](./docs/assets/with-gui.PNG 'With GUI')

### [BETA] Install E.P.A and configure it automaticlly (`eslint`, `prettier` & `airbnb`)

Installs `eslint`, `prettier` & `airbnb` and configures it automaticlly

```bash
npx freshland@latest init-epa <path/to/install> --ts
```

| Flags              | Description    |
| ------------------ | -------------- |
| --typescript, --ts | Use typescript |