# Your first personal WGT

You need a macOS or Linux computer, Node.js 22+, npm, `zip` and `unzip`. Windows is not verified. Install Node.js from [nodejs.org](https://nodejs.org/en/download). macOS normally includes the ZIP tools; on Debian/Ubuntu install them with `sudo apt install zip unzip`.

```bash
git clone https://github.com/vbrekher/lampa-personal-edition.git
cd lampa-personal-edition
npm ci
npm run builder
```

Open the local address printed in the terminal if your browser does not open automatically. The server binds to `127.0.0.1` on an available port.

1. Check the requirements, then choose your initial TV language. Every WGT contains all 21 languages.
2. Choose **I don't use TorrServer**, or enter your own HTTP(S) address. An empty address is fine.
3. Choose the parser mode. Leave third-party plugins disabled unless you understand and accept their runtime access.
4. Review the actual settings. Press **Build my WGT**.
5. Wait for the real compilation stages. Download the verified WGT and copy its SHA-256.
6. Follow the [TV installation guide](INSTALLATION.md). Downloading does not install the app automatically.

The WGT is also in `dist/Lampa-Personal-Edition.wgt`. It is unsigned and personal: do not upload it to an issue, PR or public server. Stop the Builder with Ctrl+C when finished.

Need help? [Builder Guide](BUILDER_GUIDE.md) · [Troubleshooting](TROUBLESHOOTING.md) · [FAQ](FAQ.md)
