import * as express from 'express';
import * as path from 'path';
import * as bodyParser from "body-parser";
const app = express();

app.use(express.static(path.join(__dirname, './public')))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.set("view engine", "pug")
app.set("views", path.join(__dirname, './views'))

app.get('/', (req, res) => {
    res.render("index")
})

app.listen(8080, () => {
    console.log("App is listening at port 8080!")
})