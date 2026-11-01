# Troubleshooting

## The Builder does not open

Run `npm run builder` with Node.js 22+. Keep the terminal open and copy the printed `http://127.0.0.1:<port>` address into a browser. A random available port is normal. The server accepts only its own loopback host/origin; use the exact printed address, not a network IP or `localhost` alias.

No page is expected on a public server. `site/demo/` is only an interactive preview and cannot compile.

## An environment check fails

Install [Node.js 22+](https://nodejs.org/en/download) and npm. In the repository folder, run `npm ci`. Install `zip` and `unzip` with your operating system's package manager. Use a complete source checkout. Choose **Check again** after correcting the requirement.

Windows is not a verified build host. Use macOS or Linux rather than assuming native Windows support.

## My TorrServer address is rejected

Use `http://` or `https://`, for example `http://192.168.1.100:8090`. Remove usernames, passwords, spaces, query parameters and fragments. Do not paste an authenticated playback URL or secret token. You can select **I don't use TorrServer** and build without an address.

The Builder does not contact your server, so a valid URL does not prove reachability from the TV.

## Plugin selection will not continue

Third-party JavaScript is off by default. If you enable it, read and select the acknowledgement. The catalogue alone does not grant permission. Nothing is installed during compilation; the TV retains its per-installation consent step.

## A build is already running

Only one build can run in a checkout. Return to its original browser/terminal and cancel it, or wait for completion. The CLI and wizard share the same lock. An active build in another checkout is separate.

A dead process lock is normally recovered safely. An uncatchable interruption can leave incomplete lock/recovery metadata. Close this project's build terminals and check that its compiler processes are stopped before removing `.personal-build/build.lock` or `.personal-build/recovery.lock`. Never delete an active build's lock.

## Compilation failed

Read the friendly explanation, expand the technical log and verify dependencies with `npm ci`. The most recent compiler failure log is also in `dist/build-error.log`. The log is local and redacts common credential forms/home paths; still review it before sharing. Do not paste private source or configuration into an issue.

Retry returns to configuration review. The previous successful WGT remains intact. The next build clears a stale compiler failure log. Do not edit source files while a build is copying/compiling them.

## Cancellation is taking a moment

The engine terminates the compiler process group and waits for cleanup. Keep the terminal open until cancellation finishes. Ctrl+C on the local server also cancels and cleans active work. Power loss or SIGKILL cannot run graceful cleanup.

## Download or folder opening fails

Keep the local server running. Reload the same local address to reconnect to a completed job. Download the WGT or find `dist/Lampa-Personal-Edition.wgt` in the project folder. The folder button relies on macOS `open` or Linux `xdg-open`; a headless Linux session may require opening the folder manually.

The server's private per-job download copy is removed when it shuts down. The `dist/` file remains. Starting another build replaces the active download job. Check SHA-256 against the result displayed by the wizard.

## Apps2Samsung cannot install the package

Check Developer Mode, the computer IP, network access, signing/re-signing and device firmware. Follow [Apps2Samsung's current instructions](https://github.com/Apps2Samsung/Apps2Samsung). A valid ZIP or successful desktop browser test does not certify installation on a specific TV.

## The app opens but playback does not work

Configure your own server/parser/indexers and authorized source on the TV. Check server reachability, provider availability, formats and firmware-specific player behaviour. The WGT does not include a torrent server, subscription or media content. Include only redacted device/error details in a report.
