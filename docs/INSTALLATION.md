# Install Lampa Personal Edition

This is the detailed setup for a locally compiled Samsung Tizen WGT.

**Status:** preview. Real Samsung installation and playback are not yet certified.

## Requirements

You need macOS or Linux, Node.js 18+, npm, zip, unzip, and a Samsung Tizen TV with Developer Mode. First installation of npm dependencies requires internet.

## Step 1 — prepare the TV

1. On the Samsung TV open **Apps → Settings**.
2. Use the remote to enter **12345** to open Developer Mode.
3. Enable Developer Mode and enter your **computer's IP address**, not your TorrServer's address.
4. Restart the TV and keep the computer and TV on the same LAN.

Follow [Samsung's official developer-mode guide](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html) if the menu differs on your model.

## Step 2 — build on your computer

~~~bash
git clone https://github.com/vbrekher/lampa-personal-edition.git
cd lampa-personal-edition
npm install
npm run test:personal
npm run build:personal
~~~

Choose the UI language, optional TorrServer URL, and whether to allow third-party plugins (default: no). The URL should include `http://` or `https://`, with no username/password, tokens or query parameters.

To build without questions:

~~~bash
npm run build:personal -- --language en --plugins off
~~~

The output is `dist/Lampa-Personal-Edition.wgt`. The source tree is unchanged: the build happens inside a temporary directory.

## Step 3 — install through Apps2Samsung

1. Open [Apps2Samsung](https://github.com/Apps2Samsung/Apps2Samsung/releases).
2. Select your Samsung TV or enter its IP.
3. Choose **Custom WGT** and select the file from `dist/`.
4. Follow certificate or re-signing prompts if Apps2Samsung requests them.
5. Launch **Lampa Personal Edition** from Samsung Apps.

This personal app uses ID `L4mpaPers0.LampaPersonal` and is separate from upstream Lampa.

## Step 4 — check the app

Verify the home screen, navigation, catalogue data, and any self-hosted TorrServer connection. Test an actual media stream separately. If it fails, capture a **redacted** error without including authenticated URLs.

## Updating

~~~bash
cd lampa-personal-edition
git pull --ff-only
npm install
npm run build:personal
~~~

Then reinstall the generated WGT. Do not upload it to GitHub.

## About Windows

The build process uses Node.js and Unix CLI tools. Windows + WSL2 may work but is **not verified**. A native Windows builder is not yet supported.

## Important boundaries

- This WGT does not contain TorrServer or movies.
- Compiling assets locally does not mean the app runs offline; upstream Lampa still contacts external services.
- No CUB account or TV password is embedded.
- Enabling plugins allows remote plugin JavaScript.
- The Personal Edition build has not yet passed on-device certification.

See [Troubleshooting](TROUBLESHOOTING.md) and [Security](../SECURITY.md).
