# Frequently asked questions

## Do I need to host Lampa?

No. The WGT packages the compiled application and local assets. Your optional TorrServer/parser service runs separately.

## Does the website build my WGT?

No. The product website is static. Its interactive preview demonstrates the wizard without a compiler or API. Run `npm run builder` locally for a real build.

## Can I build without TorrServer?

Yes. Choose the no-server option. An empty address is supported. Add or change it later in the TV app if needed.

## Are all 21 languages included?

Yes. The initial language selection does not remove the others. Arabic, Urdu and Hebrew retain RTL. The Builder itself has complete English, Russian and Dutch interfaces.

## Does the Builder install plugins?

No. It sets a runtime preference. Third-party JavaScript is disabled by default and needs acknowledgement when enabled. Each new installation on the TV retains its confirmation. Catalogue metadata does not guarantee a provider's availability.

## Does building install the app on my Samsung?

No. Download the unsigned WGT, then install it separately using your signing setup or Apps2Samsung. [Installation Guide](INSTALLATION.md).

## Is this certified or official?

No. This independent community fork is not endorsed by Samsung, Apps2Samsung or the original Lampa maintainers. Physical hardware certification has not been performed.

## Can I keep my old Lampa?

The Personal Edition uses a separate Tizen application ID and can coexist with upstream Lampa, subject to your device's installation/signing behaviour.

## Can I use the CLI?

Yes. `npm run build:personal` and its existing flags remain. The CLI and wizard use one engine, normalizer, lock and packager.

## Where do my settings go?

Into the current browser tab, the running local process and your local WGT. There is no configuration upload, account or telemetry. The installed TV app can contact services/providers you choose. Do not share a personal WGT.

## Can I set a separate metadata language in the wizard?

The existing safe mechanism seeds metadata from the initial interface language on a new installation and preserves existing TV metadata preferences. Change metadata/search/audio/subtitle languages independently in TV Settings. The wizard explains this instead of presenting an unsupported toggle.

## What if I cancel or compilation fails?

Temporary files are cleaned and the prior successful WGT is preserved. Return to review and retry. Graceful server shutdown also cancels active work; an uncatchable process kill cannot guarantee cleanup.

## How do I improve a translation?

Use [Improve a Translation](LOCALIZATION_GUIDE.md). A few wording changes need focused checks, not another full audit of all 21 languages.
