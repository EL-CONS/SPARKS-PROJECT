import numpy as np
import pytest

from sparkspipe import binfmt


def test_roundtrip_shapes_and_dtypes(tmp_path):
    rng = np.random.default_rng(7)
    frames = rng.integers(-30000, 30000, size=(5, 64, 64), dtype=np.int16)
    masks = rng.integers(0, 6, size=(5, 64, 64), dtype=np.uint8)
    coadds = rng.normal(size=(4, 64, 64)).astype(np.float32)
    binfmt.write_array(tmp_path / "frames.bin", frames, "frames")
    binfmt.write_array(tmp_path / "masks.bin", masks, "masks")
    binfmt.write_array(tmp_path / "coadds.bin", coadds, "coadds")

    assert binfmt.read_array(tmp_path / "frames.bin", "frames").dtype == np.dtype("<i2")
    assert binfmt.read_array(tmp_path / "masks.bin", "masks").dtype == np.dtype("u1")
    out = binfmt.read_array(tmp_path / "coadds.bin", "coadds")
    assert out.dtype == np.dtype("<f4")
    assert np.allclose(out, coadds)
    assert (tmp_path / "frames.bin").stat().st_size == 5 * 64 * 64 * 2


def test_rejects_bad_shape(tmp_path):
    (tmp_path / "frames.bin").write_bytes(b"\x00" * 7)
    with pytest.raises(ValueError):
        binfmt.read_array(tmp_path / "frames.bin", "frames")
