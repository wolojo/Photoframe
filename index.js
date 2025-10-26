import { getFile, listFiles } from './fritzBox.js';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory


app.use(express.static(path.join(__dirname, 'public')))

app.get('/api/files', async (req, res) => {
    const files = await listFiles('/Bilder/');
    
    const pics = files
    .filter(f => f.type === 'picture')
    .map(f => f.path.replace('/Bilder/', ''));
    res.send(pics)
});

app.get('/api/files/:name', async (req, res) => {
    const file = await getFile(`/Bilder/${req.params.name}`);
    
    res.type(file.type);
    const buffer = await file.arrayBuffer()
    res.send(Buffer.from(buffer));
});

app.listen(port, () => {
    console.log(`Server is running on PORT:${port}`);
});