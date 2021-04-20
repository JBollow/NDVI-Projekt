# NDVI = (NIR — VIS)/(NIR + VIS)
import cv2
import numpy as np
from PIL import Image

kernel = np.ones((5, 5), np.float32)/25

img = cv2.imread("y:/test.jpg")
if img is None:
    print('Could not open or find the image:')
    exit(0)

img = cv2.normalize(img, img, 55, 310, cv2.NORM_MINMAX)
img = cv2.filter2D(img, -1, kernel)
img = cv2.resize(img, (1600, 1200))

n = img[:, :, 0]
g = img[:, :, 1]
r = img[:, :, 2]

ndvi = (n-r)/(n+r)

# 8Bit
ndvi8 = ndvi * 256
ndvi8 = np.uint8(ndvi8)

# ndvi8 = cv2.applyColorMap(ndvi8, cv2.COLORMAP_JET)

cv2.imshow('NDVI', ndvi)
cv2.imshow('NDVI8', ndvi8)
cv2.waitKey(0)
