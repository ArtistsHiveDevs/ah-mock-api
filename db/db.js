const mongoose = require('mongoose');

const mongoURI = 'mongodb+srv://artisthive_dev:Vi1xiHun7nTtg8bQ@clusterah.olpqg.mongodb.net/?retryWrites=true&w=majority&appName=ClusterAH';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error('MongoDB connection error:', err));
