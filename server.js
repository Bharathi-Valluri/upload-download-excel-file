const express = require('express')
const router = require('./router/router')
// const sequelize = require('./db')
// const UploadExcel = require('./Entity/excel_to_db')
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors())
// sequelize.sync({ alter: true })
async function run () {
  try {
    // await sequelize.authenticate()
    // console.log('connected to the database')
    app.use('/', router)
    app.listen(process.env.PORT, () => {
      console.log(`server is running on port no:${process.env.PORT}`)
    })
  } catch (error) {
    console.log('server is not running at port 6000' + error)
  }
}
run()
