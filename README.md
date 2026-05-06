# generator-mantis

[Yeoman](https://yeoman.io) generator that scaffolds [Mantis](https://home.withmantis.com) extension bundles: manifest, extension host entry, panel UI, optional Python backend, and a small script to build `bundle.json` for import.

## Install

```bash
npm install -g yo
npm install -g generator-mantis
```

## Usage

In an empty directory:

```bash
yo mantis
node pack-bundle.cjs
```

Import `bundle.json` in Mantis (or zip per backend docs). Add another panel from the same folder:

```bash
yo mantis:panel
```

## Develop this repo

```bash
git clone https://github.com/KellisLab/generator-mantis.git
cd generator-mantis
npm install
npm test
npm link
yo mantis
```

## Contributing

Open issues and PRs on GitHub. When changing prompts or output, keep generated `mantis.extension.json` aligned with the Mantis app’s extension manifest and bundle rules. Run `npm test` before submitting.

## License

MIT — see [LICENSE](LICENSE).
