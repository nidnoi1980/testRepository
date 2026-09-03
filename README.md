# liCalendar Custom Build

This repository now contains the complete customized source code for the liCalendar version we are maintaining.

## Main source

All active source code is stored in:

`li-calendar-custom/`

The source is based on **CrankZ/li-calendar v1.0.0** and keeps the original upstream license and project files.

## Custom changes currently included

- Week number column displayed on the left side of every calendar row.
- Setting to show or hide week numbers.
- Setting to define the week containing January 1 as either **W0** or **W1**.
- Windows/WebView2 runtime scaling compensation so the taskbar popup is fully visible on high-DPI / scaled displays.
- Existing lunar calendar, Chinese holidays, work/rest-day markers and other upstream functions are retained.

See `li-calendar-custom/CUSTOM_CHANGES.md` and `li-calendar-custom/WEEK_NUMBER_MODIFICATION.md` for additional notes.

## Windows build

The GitHub Actions workflow:

`.github/workflows/build-li-calendar-weekrows.yml`

builds directly from `li-calendar-custom/`. It no longer downloads upstream source and applies patch files during every build.

Local build commands:

```powershell
cd li-calendar-custom
pnpm install
pnpm typecheck
pnpm tauri build
```

## Development rule going forward

Future changes should be made directly in `li-calendar-custom/` so Git history records the real source changes. Patch/debug files used during the initial development are no longer the source of truth.
