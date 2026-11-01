# Install your Samsung TV app

Build on your computer, then install the WGT separately. The Builder does not sign the package or install it on your TV automatically. This independent project has no Samsung hardware certification.

## Before you start

- A Samsung Tizen TV compatible with your installation tooling; the package targets TV profile 5.0+.
- The TV and computer on the same trusted network.
- Developer Mode and an appropriate signing/re-signing setup.
- Your locally generated `Lampa-Personal-Edition.wgt`.

## 1. Prepare the device

On supported Samsung models, open Apps, find Settings, enter `12345` with the remote and enable Developer Mode. Enter your **computer's IP address**, not your TorrServer address, and restart the TV when instructed. Menus vary by model; follow [Samsung's official device guide](https://developer.samsung.com/smarttv/develop/getting-started/using-sdk/tv-device.html).

## 2. Build locally

```bash
git clone https://github.com/vbrekher/lampa-personal-edition.git
cd lampa-personal-edition
npm ci
npm run builder
```

Choose a language, optionally enter TorrServer, review parser/plugin preferences and compile. The wizard downloads the result and shows its SHA-256. The file also remains in `dist/Lampa-Personal-Edition.wgt`.

Every package includes all 21 interface languages. You can leave TorrServer unconfigured and add it on the TV later. For command-line use:

```bash
npm run build:personal -- --language en --plugins off
```

## 3. Install through Apps2Samsung

1. Open [Apps2Samsung](https://github.com/Apps2Samsung/Apps2Samsung/releases).
2. Select your Samsung device or enter its IP address.
3. Choose **Custom WGT** and select your local file.
4. Follow its certificate, signing or re-signing prompts. An unsigned WGT alone does not bypass device signing requirements.
5. Launch **Lampa Personal Edition** from Samsung Apps.

The app ID `L4mpaPers0.LampaPersonal` is separate from upstream Lampa. Apps2Samsung is an independent project; consult its current instructions if its interface changes.

## 4. Check your setup

Confirm the initial language, home screen, navigation and editable settings. Configure your own services if needed. Test an authorized media source separately, including actual audio/subtitle/codec behaviour. Browser tests cannot establish firmware-specific AVPlay compatibility.

## Update

From the existing checkout:

```bash
git pull --ff-only
npm ci
npm run builder
```

Build and reinstall the new WGT. Per-setting seeding preserves ordinary TV-side edits; a changed corresponding builder default applies that managed setting. Existing metadata preferences remain independent. Recheck your device's signing/update requirements.

Do not upload your personal WGT or authenticated media addresses. See [Compatibility](COMPATIBILITY.md) and [Troubleshooting](TROUBLESHOOTING.md).
