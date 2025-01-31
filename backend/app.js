
import express from 'express';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));



app.get('/', (req, res) =>{
    res.send('Welcome');
});

app.get('/hs', (req, res) =>{
    res.send('Welcome hs');
});
export default app;