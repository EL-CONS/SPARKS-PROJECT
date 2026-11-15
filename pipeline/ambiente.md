# Pipeline environment

A dedicated environment, separate from the rest of the repository and with
nothing from the previous project.

## How it was created

```powershell
cd "D:\NASA Hackathon\SPARKS-PROJECT"
python -m venv pipeline/.venv
pipeline\.venv\Scripts\python.exe -m pip install -r pipeline/requirements.txt
```

Python version: 3.12 (Windows 11, `C:\Program Files\Python312`).

## Installed versions (`pip freeze` output)

```
astropy==8.0.2
astropy_healpix==2.0.1
matplotlib==3.11.2
numpy==2.5.4
pillow==13.0.0
pytest==9.2.0
pyvo==1.10.0
reproject==0.21.0
requests==2.34.2
scipy==1.18.1
```

`astropy-iers-data==0.2026.11.9.0.35.9` comes with astropy.

## Usage

```powershell
cd pipeline
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m sparkspipe discover all
.\.venv\Scripts\python.exe -m sparkspipe run all --workers 3
.\.venv\Scripts\python.exe -m sparkspipe verify ..\data-new\wise0855
```

## What is not committed to git

`pipeline/.venv/` and `pipeline/_work/` (SIA responses of tens of MB, raw
cutouts and processed cutouts) are in `.gitignore`. The publishable products in
`data-new/` are small and are committed.
