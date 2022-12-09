const excelJs = require('exceljs')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const UploadExcel = require('../Entity/excel_to_db')

const ReadExcelFile = async (req, res) => {
  try {
    let data = []
    console.log(req.file.path)
    const workbook = new excelJs.Workbook()
    await workbook.xlsx.readFile(req.file.path)
    workbook.eachSheet(sheet => {
      if (sheet.columnCount <= 2) {
        sheet.eachRow(function (row) {
          if (
            onlyAlphabets(row.values[1]) &&
            containsOnlyNumbers(row.values[2]) &&
            ((row.values[1] != '' && row.values[2] != '') ||
              (row.values[1] == '' && row.values[2] == ''))
          ) {
            const JsonData = {
              Name: row.values[1],
              Age: row.values[2]
            }
            console.log('Name:', row.values[1])
            console.log('Age:', row.values[2])

            data.push(JsonData)
            console.log('result', JsonData)
          } else {
            console.log('validation failed')
          }
        })
      } else {
        console.log('column count is more than 2')
      }
    })

    // data.shift()
    const resp = await UploadExcel.bulkCreate(data)
    res.status(200).json({
      response: resp,
      message: 'successfuly inserted the .xlsx file into db'
    })
  } catch (error) {
    console.log(error.message)
    // res.status(400).json({
    //   response: null,
    //   message: 'failed to fetch .xlsx data into db'
    // })
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
    //console.log(resp);

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
    res.send('pdf converted successfully')
  } catch (error) {
    console.log(error)
  }
}

//Validation function
function onlyAlphabets (str) {
  return /^[a-zA-Z]+$/.test(str)
}

function containsOnlyNumbers (str) {
  return /^[0-9]+$/.test(str)
}

module.exports = { ReadExcelFile, DownloadPDFfile }
