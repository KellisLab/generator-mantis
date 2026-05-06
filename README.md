# generator-mantis

[Yeoman](https://yeoman.io) generator that scaffolds [Mantis](https://home.withmantis.com) extension bundles: manifest, extension host entry, panel UI, optional Python backend, and a script that builds **`package.mantisx`** (zip for API upload) plus **`bundle.json`**.

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

Import **`package.mantisx`** or **`bundle.json`** in Mantis. Add another panel from the same folder:

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
