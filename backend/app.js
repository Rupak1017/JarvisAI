import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
connect();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/users' , userRoutes);



app.get('/', (req, res) =>{
    res.send('Welcome');
});

app.get('/hs', (req, res) =>{
    res.send('Welcome hs');
});
export default app;