const excel_controller = require('../controller/excelController')
const router = require('express').Router()
const multer = require('multer')
const fs = require('fs')
const path = require('path')
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './Upload')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

//multer upload

const upload = multer({
  storage: storage
})
router.post(
  '/readExcelData',
  upload.single('path'),
  excel_controller.readExcelFile
)
router.get('/getValuesFromCache', excel_controller.getValues)

router.post('/readcsvdata', upload.single('path'), excel_controller.upload)
// router.get('/downloadFileData', excel_controller.initCache)

module.exports = router
