from bottle import route, run, template, request, response, post
import json
from json import dumps
import cv2
import numpy as np
import os
import time

localPath = os.path.abspath(os.path.dirname(__file__))
ndviPath = localPath + "/app_client/NDVI_Temp/"
ndviArchiv = localPath + "/app_client/NDVI_Archiv/"
cirPath = localPath + "/app_client/CIR_Temp/"
kernel = np.ones((5, 5), np.float32)/25

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
    filename = "cir.jpg"
    cir_file_path = os.path.abspath(os.path.join(localPath, cirPath, filename))
    
    time.sleep(1)
    img = cv2.imread(cir_file_path)

    if img is None:
        print('Could not open or find the image:')
        return json.dumps(failed)

    img = cv2.normalize(img, None, alpha=0, beta=1, norm_type=cv2.NORM_MINMAX, dtype=cv2.CV_32F)
    img = cv2.filter2D(img, -1, kernel)
    img = cv2.resize(img, (1600, 1200))

    ir = img[:, :, 0].astype(float)
    r = img[:, :, 2].astype(float)
    bottom = np.add(ir, r)
    bottom[bottom == 0] = 0.01
    ndvi = np.subtract(ir, r)/bottom

    # 8Bit
    ndvi8 = ndvi*255
    ndvi8 = np.uint8(ndvi8)

    print("image processed")
    writeStatus = cv2.imwrite(os.path.join(localPath, ndviPath, "ndvi.jpg"), ndvi8)
    if writeStatus is True:
        print("image written")
        cv2.imwrite(os.path.join(localPath, ndviArchiv, cirname), ndvi8)
        return json.dumps(success)
    else:
        print("problem")
        cv2.imwrite(os.path.join(localPath, ndviArchiv, cirname), ndvi8)
        return json.dumps(success) 

run(host='0.0.0.0', reloader=True, port=8088)
