# Dictionary coverage snapshot

The canonical union grew from 1,348 to **1,351** keys: `country_ba`, `about_hash`, `about_build_date` were added to the reference set. `country_ba` already existed in some legacy locales but not the reference dictionaries.

“Present” counts nonempty owned values; it is **not a claim of correct translation**. Identical source values are review signals, including possible brands and legitimate cognates. No broad allowlist suppresses these signals.

| Locale | Runtime state | Present | Coverage | English copies | Russian copies | Acceptance |
|---|---|---:|---:|---:|---:|---|
| nl | Draft | 100/1351 | 7.4% | 13 | 0 | NOT_READY |
| de | Draft | 100/1351 | 7.4% | 10 | 0 | NOT_READY |
| tr | Draft | 100/1351 | 7.4% | 1 | 0 | NOT_READY |
| en | Shipped | 1351/1351 | 100% | 0 | 0 | NOT_READY |
| zh | Shipped | 1351/1351 | 100% | 17 | 0 | NOT_READY |
| hi | Draft | 100/1351 | 7.4% | 1 | 0 | NOT_READY |
| es | Shipped | 1351/1351 | 100% | 101 | 0 | NOT_READY |
| ar | Draft | 100/1351 | 7.4% | 1 | 0 | NOT_READY |
| fr | Shipped | 1351/1351 | 100% | 127 | 0 | NOT_READY |
| bn | Draft | 100/1351 | 7.4% | 1 | 0 | NOT_READY |
| pt | Shipped | 1351/1351 | 100% | 107 | 0 | NOT_READY |
| id | Draft | 100/1351 | 7.4% | 5 | 0 | NOT_READY |
| ur | Draft | 100/1351 | 7.4% | 1 | 0 | NOT_READY |
| be | Shipped | 1336/1351 | 98.9% | 6 | 84 | NOT_READY |
| bg | Shipped | 1330/1351 | 98.4% | 16 | 177 | NOT_READY |
| cs | Shipped | 1349/1351 | 99.9% | 59 | 0 | NOT_READY |
| he | Shipped | 1307/1351 | 96.7% | 257 | 0 | NOT_READY |
| pl | Shipped | 1349/1351 | 99.9% | 72 | 0 | NOT_READY |
| ro | Shipped | 1330/1351 | 98.4% | 149 | 0 | NOT_READY |
| ru | Shipped | 1349/1351 | 99.9% | 5 | 0 | NOT_READY |
| uk | Shipped | 1351/1351 | 100% | 5 | 134 | NOT_READY |

All 13 shipped locales and all eight drafts have zero duplicate properties, empty owned values, detected placeholder mismatches, and detected malformed HTML/Unicode after these repairs. Missing legacy keys still fall back at runtime; there is no claim of fallback-free coverage. The source inventory records 1,774 references to 1,124 distinct keys and 85 dynamic calls. The union of reference keys and statically referenced keys is 1,351; dynamically generated keys and hardcoded text still require review.
