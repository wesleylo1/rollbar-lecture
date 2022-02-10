require('dotenv').config()
const express = require('express')

const app = express()

const path = require('path') // provides utility for working with file and directory paths, provided by Node
const { send } = require('process')

// rollbar - need to install rollbar from npm before using it

const Rollbar = require('rollbar')
const rollbar = new Rollbar({
  accessToken: process.env.ROLLBAR_TOKEN,
  captureUncaught: true,
  captureUnhandledRejections: true,
})

// rollbar

app.use(express.json())

const students = ['jimmy','jack','joe','jill']

app.get('/', (req,res) => {
    rollbar.log('Someone hit the server!')
    res.sendFile(path.join(__dirname, '../public/index.html'))
})

app.get('/api/students',(req,res) => {
    rollbar.info('Someone got all the students!')
    res.status(200).send(students)
})

app.post('/api/students', (req,res) => {
    let {name}=req.body;
    students.unshift(name)

    res.status(200).send(students)
})

app.get('/api/students/:idx', (req,res) => {
    const idx = +req.params.idx;

    if(idx < 0 || idx >= students.length) {
        if (idx < 0) {
            rollbar.error('someone tried to get an index less than 0')
        } else {
            rollbar.error('someone tried to get an index out of range')
        }
        return res.sendStatus(400);
    }
    res.status(200).send(students[idx])
})

app.delete('/api/students/:index', (req,res) => {
    if (req.params.index === '0') {
        rollbar.error('someone tried to delete the first student')
        return res.status(403).send(students)
    }
    let {index} = req.params;
    students.splice(+index,1)
    rollbar.info(`Someone deleted student ${students[+index]}`)


    res.status(200).send(students)
})

const port = process.env.PORT || process.env.SERVER_PORT

app.listen(port, () => console.log(`Server serving on ${port}`))