from bottle import route, run, template, request, response, post
import json
from json import dumps
import cv2
import numpy as np
import os

localPath = os.path.abspath(os.path.dirname( __file__ ))
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
    print("/ Nix")
    return '<b>This is a simple python server, set up using the Bottle framework.</b>'


@post('/ndvi')
def ndvi():
    print("NDVI")
    req = request.json

    filename = req['filename']    
    cir_file_path = os.path.abspath(os.path.join(localPath, cirPath, filename))

    print("filename")
    print(filename)
    print(cir_file_path)

    cv2.waitKey(15000) 

    img = cv2.imread(cir_file_path)
    cv2.waitKey(0) 
    print("image read")

    if img is None:
        print('Could not open or find the image:')
        response.headers['Content-Type'] = 'application/json'
        response.headers['Cache-Control'] = 'no-cache'
        return json.dumps(failed)

    img = cv2.normalize(img, img, 55, 310, cv2.NORM_MINMAX)
    img = cv2.filter2D(img, -1, kernel)
    img = cv2.resize(img, (1600, 1200))

    n = img[:, :, 0]
    r = img[:, :, 2]

    ndvi = (n-r)/(n+r)

    # 8Bit
    ndvi8 = ndvi * 256
    ndvi8 = np.uint8(ndvi8)

    print("image processed")    

    cv2.imwrite(os.path.join(localPath, ndviPath, "ndvi.jpg"), ndvi8)
    cv2.imwrite(os.path.join(localPath, ndviArchiv, filename), ndvi8)

    print("image saved")

    cv2.waitKey(10000)

    response.headers['Content-Type'] = 'application/json'
    response.headers['Cache-Control'] = 'no-cache'
    return json.dumps(success)


run(host='localhost', reloader=True, debug=True, port=8088)
