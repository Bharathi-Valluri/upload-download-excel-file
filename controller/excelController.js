const excelJs = require('exceljs')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const UploadExcel = require('../Entity/excel_to_db')
const csv = require('fast-csv')
const Redis = require('redis')
const { redisConnect } = require('./commonService')
const redis_port = process.env.REDIS_PORT || 6397
// const client = Redis.redisConnect(redis_port)

const readExcelFile = async (req, res) => {
  try {
    console.log(req.file.path)
    let Data = []
    let errorMsg = []
    let actualCount
    let rCount
    let result
    let client = (await redisConnect()).response
    // console.log('client', client)
    console.log(req.file)
    const workbook = new excelJs.Workbook()
    if (req.file.filename.includes('.xlsx')) {
      file = await workbook.xlsx.readFile(req.file.path)
      let worksheet = workbook.getWorksheet[0]
      actualCount = workbook.worksheets[0].actualRowCount
      rCount = workbook.worksheets[0].rowCount
      console.log(rCount)
      if (actualCount > 1) {
        let resp = validateHeaders(workbook.worksheets[0].getRow(1).values)
        //header validation
        if (resp.status === 'ERROR') {
          errorMsg.push({ location: resp.location, message: resp.message })
        } else {
          for (let index = 2; index <= rCount; index++) {
            let resp = fieldValidation(
              workbook.worksheets[0].getRow(index).values
            )
            console.log(resp)
            if (resp.status === 'Success') {
              Data.push(resp.data)
            } else {
              for (const msg of resp.message) {
                errorMsg.push({
                  location: 'Row' + index,
                  message: msg.message
                })
              }
            }
          }
        }
      } else {
        errorMsg.push('Data is not available in sheet ')
      }
      console.log(Data)
      console.log(errorMsg)
      // //Db Insertion
      if (errorMsg.length > 0) {
        throw 'Insertion failed'
      } else {
        result = await UploadExcel.bulkCreate(Data)
        console.log(result)
      }
    } else if (req.file.filename.includes('.csv')) {
      const file = await workbook.csv.readFile(req.file.path)
      fs.unlinkSync(req.file.path)
      let worksheet = workbook.getWorksheet[0]
      actualCount = workbook.worksheets[0].actualRowCount
      rCount = workbook.worksheets[0].rowCount
      console.log(rCount)
      if (actualCount > 1) {
        let resp = validateHeaders(workbook.worksheets[0].getRow(1).values)
        //header validation
        if (resp.status === 'ERROR') {
          errorMsg.push({ location: resp.location, message: resp.message })
        } else {
          for (let index = 2; index <= rCount; index++) {
            let resp = fieldValidation(
              workbook.worksheets[0].getRow(index).values
            )
            console.log(resp)
            if (resp.status === 'Success') {
              const redisValue = JSON.stringify(resp.data)
              client.set(index.toString(), redisValue, function (err, data) {
                console.log(data)
              })
              Data.push(resp.data)
            } else {
              for (const msg of resp.message) {
                errorMsg.push({
                  location: 'Row' + index,
                  message: msg.message
                })
              }
            }
          }
        }
      } else {
        errorMsg.push('Data is not available in sheet ')
      }

      // //Db Insertion
      if (errorMsg.length > 0) {
        throw 'Insertion failed'
      } else {
        result = await UploadExcel.bulkCreate(Data)
        console.log(result)
      }
    }
    res.status(200).json({
      response: result,
      message: 'success'
    })
  } catch (error) {
    res.send(error)
  }
}
const upload = async (req, res) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send('Please upload a CSV file!')
    }
    let users = []
    let path = `/home/bharathi/upload-download-excel-file/` + req.file.path
    fs.createReadStream(path)
      .pipe(csv.parse({ strictColumnHandling: true, headers: true }))
      .on('error', error => {
        throw error.message
      })
      .on('data', row => {
        users.push(row)
      })
      .on('end', () => {
        UploadExcel.bulkCreate(users)
          .then(() => {
            res.status(200).send({
              message:
                'Uploaded the file successfully: ' + req.file?.originalname
            })
          })
          .catch(error => {
            res.status(500).send({
              message: 'Fail to import data into database!',
              error: error.message
            })
          })
      })
    console.log(users)
  } catch (error) {
    console.log(error)
    res.status(500).send({
      message: 'Could not upload the file: ' + req.file?.originalname
    })
  }
}
const getValues = async (req, res) => {
  try {
    const client = await (await redisConnect().response).get('8')
    console.log('client********', client)
    res.status(200).json({
      response: 'success',
      message: 'successfully fetched from cache!....'
    })
  } catch (error) {
    console.log(error)
    res.status(400).json({
      response: null,
      message: 'failed!...'
    })
  }
}

function onlyLetters (str) {
  return /^[a-zA-Z]+$/.test(str)
}

function containsOnlyNumbers (str) {
  return /^[0-9]+$/.test(str)
}

//validation function
function validateHeaders (headerRow) {
  if (headerRow[1] !== 'Name' || headerRow[2] !== 'Age') {
    return { status: 'ERROR', location: 'ROW 1', message: 'Incorrect Header.' }
  } else {
    return { status: 'SUCCESS' }
  }
}
function fieldValidation (row) {
  //console.log("row:", row);
  let errorArray = []
  if (!onlyLetters(row[1])) {
    errorArray.push({
      status: 'Error',
      message: 'Name is not valid'
    })
  }

  if (!containsOnlyNumbers(row[2])) {
    errorArray.push({
      status: 'Error',
      message: 'Age is not valid'
    })
  }

  if (errorArray.length === 0) {
    return {
      status: 'Success',
      data: {
        Name: row[1],
        Age: row[2]
      }
    }
  } else {
    return { status: 'Error', message: errorArray }
  }
}

module.exports = {
  upload,
  getValues,
  readExcelFile
}
