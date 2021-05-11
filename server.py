from bottle import route, run, template, request, response, post
import json
from json import dumps
import numpy
import os
import time
import pyvips
from colormaps import RdYlGn_lut
from pathlib import Path

localPath = os.path.abspath(os.path.dirname(__file__))
ndviPath = localPath + "/app_client/NDVI_Temp/"
ndviArchiv = localPath + "/app_client/NDVI_Archiv/"
cirPath = localPath + "/app_client/CIR_Temp/"
thumbs = ndviArchiv + "thumbs/"
previews = ndviArchiv + "previews/"
kernel = numpy.ones((5, 5), numpy.float32)/25

numpy.set_printoptions(threshold=numpy.inf)

failed = [
    {
        "response": "fail"
    }
]

success = [
    {
        "response": "success"
    }
]

def result_histogram(result):
    np_2d = numpy.ndarray(
        buffer=result.write_to_memory(),
        dtype=numpy.float32,
        shape=[result.height, result.width]
    )

    flat_result = np_2d.flatten()

    histogram = numpy.histogram(flat_result, bins=256)[0]
    return histogram


def math_map_value(value, in_low, in_high, to_low, to_high):
    return to_low + (value - in_low) * (to_high - to_low) / (in_high - in_low)


def find_clipped_min_max(histogram, nmin, nmax):
    summed = sum(histogram)
    three_percent = summed * 0.03
    lower_sum = 0
    upper_sum = 0
    last_lower_i = 0
    last_upper_i = 0

    histogram_len = len(histogram)

    for i in range(histogram_len):
        if lower_sum < three_percent:
            lower_sum += histogram[i]
            last_lower_i = i
        if upper_sum < three_percent:
            upper_sum += histogram[histogram_len - 1 - i]
            last_upper_i = histogram_len - 1 - i
    return {
        'nmin': math_map_value(last_lower_i, 0, 255, nmin, nmax),
        'nmax': math_map_value(last_upper_i, 0, 255, nmin, nmax)
    }


def bandsplit(image, band_order):
    if band_order == 'GRN':
        second, first, third, alpha = image.bandsplit()
    else:
        first, second, third, alpha = image.bandsplit()

    return [first, second, third, alpha]


def ndvi_calc(image, band_order):
    r, g, nir, alpha = bandsplit(image, band_order)
    index = (nir - r) / (nir + r)
    return [alpha, index]


@route('/')
def meta(x='NA'):
    # print("/ Nix")
    return '<b>This is a simple python server, set up using the Bottle framework.</b>'


@post('/ndvi')
def ndvi():
    # print("NDVI")
    req = request.json
    response.headers['Content-Type'] = 'application/json'
    response.headers['Cache-Control'] = 'no-cache'
    cirname = req['filename']
    filename = cirname + ".png"
    cir_file_path = os.path.abspath(os.path.join(localPath, cirPath, filename))

    time.sleep(3)

    image = pyvips.Image.new_from_file(cir_file_path)

    image = image.resize(1/2)
    image = image.gaussblur(2)

    alpha, result = ndvi_calc(image, 'RGN')
    histogram = result_histogram(result)
    clip_min_max = find_clipped_min_max(histogram, result.min(), result.max())
    nmin = clip_min_max['nmin']
    nmax = clip_min_max['nmax']
    result = ((result-nmin) / (nmax-nmin)) * 256
    rdylgn_image = pyvips.Image.new_from_array(RdYlGn_lut).bandfold()
    rgb = result.maplut(rdylgn_image)    

    # print("image processed")
    rgb.bandjoin(alpha).write_to_file(os.path.join(localPath, ndviPath, "ndvi.jpg"))
    # print("image written")
    rgb.bandjoin(alpha).write_to_file(os.path.join(localPath, ndviArchiv, cirname))
    # Path(os.path.join(localPath, previews)).mkdir(parents=True, exist_ok=True)
    # Path(os.path.join(localPath, thumbs)).mkdir(parents=True, exist_ok=True)
    # rgb.thumbnail_image(500).write_to_file(os.path.join(localPath, previews, cirname))
    # rgb.thumbnail_image(100).write_to_file(os.path.join(localPath, thumbs, cirname))

    dir = os.path.join(localPath, cirPath)
    for f in os.listdir(dir):
        os.remove(os.path.join(dir, f))
    return json.dumps(success)

run(host='0.0.0.0', reloader=True, port=8088)