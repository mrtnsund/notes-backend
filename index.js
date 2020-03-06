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
        if(note){
            response.json(note.toJSON())
        } else {
            response.status(404).end()
        }
    })
    .catch(error => {
        console.log(error)
        response.status(400).send({ error: 'malformatted id' })
    })
})

app.put('/api/notes/:id', (request, response, next) => {
    const body = request.body
    const note = {
        content: body.content,
        important: body.important,
    }

    Note.findByIdAndUpdate(request.params.id, note, { new:true })
        .then(updatedNote => {
            console.log(`Toggled note important: ${note.important}`)
            response.json(updatedNote.toJSON())
        })
        .catch(error => next(error))
})

app.post('/api/notes', (request, response, next) => {
    const body = request.body

    const note = new Note({
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })
    note
        .save()
        .then(savedNote =>  savedNote.toJSON())
        .then(savedAndFormattedNote => {
            response.json(savedAndFormattedNote)
        })
        .catch(error => next(error))
})


app.delete('/api/notes/:id', (request, response) => {
    Note.findByIdAndRemove(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}
app.use(unknownEndpoint)
const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if(error.name === 'CastError' && error.kind == 'ObjectId'){
        return response.status(400).send({ error: 'malformatted id '})
    } else if (error.name === 'ValidationError'){
        return response.status(400).json({ error: error.message })
    }
    next(error)
}
app.use(errorHandler)