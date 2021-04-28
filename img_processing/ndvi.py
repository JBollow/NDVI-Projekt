# NDVI = (NIR — VIS)/(NIR + VIS)
import cv2
import numpy as np
from PIL import Image
import os

localPath = os.path.dirname(__file__)
ndviPath = localPath + "../NDVI_Temp/"
cirPath = localPath + "../CIR_Temp/" 
kernel = np.ones((5, 5), np.float32)/25

def ndvi(filename):
    cir = filename
    cir_file_path = os.path.join(localPath, cirPath, cir)

    img = cv2.imread(cir_file_path)

    if img is None:
        print('Could not open or find the image:')
        return json.dumps(failed)        

    img = cv2.normalize(img, img, 55, 310, cv2.NORM_MINMAX)
    img = cv2.filter2D(img, -1, kernel)
    img = cv2.resize(img, (1600, 1200))

    n = img[:, :, 0]
    r = img[:, :, 2]

    ndvi = (n-r)/(n+r)
    print("image processed")

    cv2.imwrite(os.path.join(localPath, ndviPath, filename), ndvi)

    print("image saved")
    return json.dumps(success)