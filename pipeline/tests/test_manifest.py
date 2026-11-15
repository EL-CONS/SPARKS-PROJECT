import numpy as np

from sparkspipe import manifest
from sparkspipe.config import N_PIX
from sparkspipe.grid import target_wcs


def test_frame_encoding_roundtrip():
    rng = np.random.default_rng(3)
    image = rng.normal(0.16, 0.07, size=(N_PIX, N_PIX))
    encoded = manifest.frame_to_int16(image, 0.16, 0.07)
    assert encoded.dtype == np.int16
    decoded = 0.16 + encoded.astype(float) / manifest.FRAME_GAIN * 0.07
    assert np.nanmax(np.abs(decoded - image)) < 0.07 / manifest.FRAME_GAIN


def test_frame_encoding_clips():
    image = np.array([[1e6, -1e6]])
    encoded = manifest.frame_to_int16(image, 0.0, 1.0)
    assert encoded.max() == manifest.FRAME_CLIP
    assert encoded.min() == -manifest.FRAME_CLIP


def test_stretch_covers_full_range():
    data = np.linspace(-1, 5, 100).reshape(10, 10)
    out = manifest.stretch_uint8(data, -1, 5, gamma=1.0)
    assert out.dtype == np.uint8
    assert out.min() == 0 and out.max() == 255


def test_target_wcs_pixel_scale():
    wcs = target_wcs(120.0, -10.0)
    assert wcs.wcs.crpix.tolist() == [32.5, 32.5]
    assert abs(abs(wcs.wcs.cdelt[0]) * 3600.0 - 6.15) < 1e-6


def test_detector_scales_contain_data():
    class FakeCoadd:
        def __init__(self, det, image, sigma):
            self.det = det
            self.image = image
            self.sigma = sigma

    rng = np.random.default_rng(11)
    img = rng.normal(0, 1, size=(N_PIX, N_PIX))
    coadds = [FakeCoadd(1, img, np.full_like(img, 0.1))]
    frames = [{"det": 1, "image": img}]
    scales = manifest.detector_scales(frames, coadds)
    assert "1" in scales
    assert scales["1"]["lo"] <= float(img.min())
    assert scales["1"]["hi"] >= float(img.max())
    assert scales["1"]["lo"] < scales["1"]["hi"]
