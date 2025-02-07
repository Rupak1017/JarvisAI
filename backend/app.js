import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js';
import cookieParser from 'cookie-parser';
connect();
import cors from 'cors';

const app = express();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());

app.use('/users' , userRoutes);
app.use('/projects', projectRoutes);



app.get('/', (req, res) =>{
    res.send('Welcome');
});

app.get('/hs', (req, res) =>{
    res.send('Welcome hs');
});
export default app;