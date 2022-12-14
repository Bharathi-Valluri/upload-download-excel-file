const excelJs = require('exceljs')
const PDFDocument = require('pdfkit')
const fs = require('fs')
const UploadExcel = require('../Entity/excel_to_db')

const readExcelFile = async (req, res) => {
  try {
    let ArrayOfData = []
    let result = []
    const workbook = new excelJs.Workbook()
    await workbook.xlsx.readFile(req.file.path)
    fs.unlinkSync(req.file.path)

    workbook.eachSheet(function (workSheet) {
      const actualCount = workSheet.actualRowCount
      const rCount = workSheet.rowCount
      console.log(rCount)
      if (actualCount > 1) {
        let resp = validateHeaders(workSheet.getRow(1).values)
        //header validation
        if (resp.status === 'ERROR') {
          result.push({ location: resp.location, message: resp.message })
        } else {
          for (let index = 2; index <= rCount; index++) {
            const element = workSheet.getRow(index).values
            console.log('Element', element)
            if (
              workSheet.getRow(index).values[1] == null ||
              workSheet.getRow(index).values[2] == null
            ) {
              result.push({
                Message: 'Field must not be empty',
                location: 'Row' + index
              })
            } else {
              if (
                onlyAlphabets(workSheet.getRow(index).values[1]) &&
                containsOnlyNumbers(workSheet.getRow(index).values[2])
              ) {
                let data1 = {
                  Name: element[1],
                  Age: element[2]
                }
                ArrayOfData.push(data1)
              } else {
                result.push({
                  status: 'ERROR',
                  error_Name: workSheet.getRow(index).values[1],
                  errors_Age: workSheet.getRow(index).values[2]
                })
              }
            }
          }
        }
      } else {
        result.push('Data is not found in the excel sheet ')
      }
      console.log(result)
      console.log(ArrayOfData)
    })
    const resp = await UploadExcel.bulkCreate(ArrayOfData)
    res.status(200).json({
      response: resp,
      message: 'success!..'
    })
  } catch (error) {
    console.log(error.message)
    res.status(400).json({
      response: null,
      message: 'failed!...'
    })
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
    Nam
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

function onlyAlphabets (str) {
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

module.exports = {
  readExcelFile,
  DownloadPDFfile
}
