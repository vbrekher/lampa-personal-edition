# RTL acceptance

| Locale | State | Browser observation | RTL acceptance |
|---|---|---|---|
| ar | Draft, unpublished | NOT_RUN | BLOCKED |
| ur | Draft, unpublished | NOT_RUN | BLOCKED |
| he | Shipped | Keyboard language selection/restart and home/settings observed | FAIL |

Hebrew browser observation at 1920×1080: `document.documentElement.lang === "en"`, `dir === ""`, body and Settings computed direction both `ltr`. The Parser label is English. A startup state briefly displayed English “Prepare ready”. Content titles from external metadata are not counted as application translation failures.

Screenshots include Hebrew home/settings at 1920×1080 and Settings at 3840×2160. These are failure evidence, not RTL approval. No broad CSS mirroring was introduced without validating focus geometry.

Remaining: proper root language/direction lifecycle, logical layout properties, modal/menu/card focus order, mixed URL/IP/code/time isolation, input copy/paste, subtitles and player controls, Arabic/Urdu font coverage and real remote navigation. Posters, QR codes and video must remain unmirrored.

See [individual RTL reports](rtl/).
