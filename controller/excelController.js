const excelJs = require('exceljs')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const axios = require('axios')
const UploadExcel = require('../Entity/excel_to_db')

const readExcelFile = async (req, res) => {
  try {
    let Data = []
    let errorMsg = []
    const workbook = new excelJs.Workbook()
    await workbook.xlsx.readFile(req.file.path)
    fs.unlinkSync(req.file.path)
    let workSheet = workbook.getWorksheet[0]
    const actualCount = workbook.worksheets[0].actualRowCount
    const rCount = workbook.worksheets[0].rowCount
    console.log(rCount)
    if (actualCount > 1) {
      let resp = validateHeaders(workbook.worksheets[0].getRow(1).values)
      //header validation
      if (resp.status === 'ERROR') {
        msg.push({ location: resp.location, message: resp.message })
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
      msg.push('Data is not available in sheet ')
    }
    console.log(Data)
    console.log(errorMsg)
    // //Db Insertion
    let resp
    if (errorMsg.length > 0) {
      throw 'Insertion failed'
    } else {
      resp = await UploadExcel.bulkCreate(Data)
      console.log(resp)
    }
    if (resp.length > 0) {
      await axios.get('http://localhost:5000/downloadPdfFileData')
    }
    res.status(200).json({
      response: resp,
      message: 'success'
    })
  } catch (error) {
    res.send(error)
    console.log(error)
  }
}

const DownloadPDFfile = async (req, res) => {
  try {
    const resp = await UploadExcel.findAll({
      where: {},
      attributes: {
        exclude: ['Name', 'id']
      }
    })
    console.log(resp)

    let sum = 0
    let count = 0
    let array = []
    for (let index = 0; index < resp.length; index++) {
      array.push(parseInt(resp[index].Age))
      count++
    }
    array.map(res => {
      sum += res
    })
    console.log('Sum of age:', sum)
    console.log('Count :', count)

    // Create a document
    const doc = new PDFDocument()
    doc.pipe(fs.createWriteStream('./Upload/Name_Age_output.pdf'))
    doc
      .fontSize(25)
      .text(
        `total records in xlsx file: ${count} || average:${(
          sum / count
        ).toPrecision(3)}`
      )
    doc.end()
    res.send('converted into PDF format successfully!...')
  } catch (error) {
    console.log(error)
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
  readExcelFile,
  DownloadPDFfile
}
