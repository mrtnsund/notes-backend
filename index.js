require('dotenv').config()
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const Note = require('./models/note')

app.use(cors())
app.use(express.static('build'))
app.use(bodyParser.json())

app.get('/', (req,res) => {
    res.send('<h1>Overskrift</h1>')
})

app.get('/api/notes', (req,res) => {
    Note.find({}).then(notes => {
        res.json(notes.map(note => note.toJSON()))
    })
})

app.get('/api/notes/:id', (request,response) => {
    Note.findById(request.params.id).then(note => {
        response.json(note.toJSON())
    })
})

const generateId = () => {
    const maxId = notes.length > 0
        ? Math.max(...notes.map(n => n.id))
        : 0
    return maxId + 1
}
app.post('/api/notes', (request, response) => {
    const body = request.body
    if(!body.content){
        return response.status(400).json({
            error: 'content missing'
        })
    }
    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })
    note.save().then(savedNote => {
        response.json(savedNote.toJSON())
    })
})

app.delete('/api/notes/:id', (request, response) => {
    const id = Number(request.params.id)
    notes = notes.filter(note => note.id !== id)
    response.status(204).end()
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
