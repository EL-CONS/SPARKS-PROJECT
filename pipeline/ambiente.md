# Entorno de la canalizacion

Entorno propio, separado del resto del repositorio y sin nada del proyecto
anterior.

## Como se creo

```powershell
cd "D:\NASA Hackathon\SPARKS-PROJECT"
python -m venv pipeline/.venv
pipeline\.venv\Scripts\python.exe -m pip install -r pipeline/requirements.txt
```

Version de Python: 3.12 (Windows 11, `C:\Program Files\Python312`).

## Versiones instaladas (salida de `pip freeze`)

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

`astropy-iers-data==0.2026.11.9.0.35.9` viene con astropy.

## Uso

```powershell
cd pipeline
.\.venv\Scripts\python.exe -m pytest tests -q
.\.venv\Scripts\python.exe -m sparkspipe discover all
.\.venv\Scripts\python.exe -m sparkspipe run all --workers 3
.\.venv\Scripts\python.exe -m sparkspipe verify ..\data-new\wise0855
```

## Que no entra a git

`pipeline/.venv/` y `pipeline/_work/` (respuestas SIA de decenas de MB,
recortes crudos y recortes procesados) estan en `.gitignore`. Los productos
publicables de `data-new/` son pequenos y si entran.
