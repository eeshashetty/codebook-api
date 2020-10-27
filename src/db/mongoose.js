const mongoose = require('mongoose')

url = 'mongodb+srv://task-eesha:es24102k@cluster0.oat3o.gcp.mongodb.net/codebookapi-final?retryWrites=true&w=majority'

mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})