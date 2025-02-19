const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');


const app= express();
app.use(express.json());
app.use(cors());

let todo=[];
mongoose.connect('mongodb+srv://22d156:DcT2trNbCBqHTjl8@todo.5mjui.mongodb.net/todolist')
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.log('Error connecting to MongoDB:', err));

const todoSchema = new mongoose.Schema({
    title: {
        required:true,
        type:String
    },
    description: String,
});

const Todomodel = mongoose.model('Todo', todoSchema);

app.post('/todo', async (req,res)=>{
    const {title,description}=req.body;
    // const newnode={
    //     id:todo.length+1,
    //     title,
    //     description
    // };
    // todo.push(newnode);
    // console.log(newnode);
    try {
        const newtodo=new Todomodel({title,description})
        await newtodo.save()   
        res.status(201).json(newtodo)
    } catch (error) {
        console.log(error);
        res.status(500).json({'message':error.message})
        
    }

})

app.get('/todo', async (req,res)=>{
    try {
        const todos=await Todomodel.find();
        res.json(todos);
    } catch (error) {
        console.log(error);
        res.status(500).json({'message':error.message})
    }
})

app.put('/todo/:id', async (req, res) => {
    try {
        const { title, description } = req.body;
        const id = req.params.id;
        
        const updatedtodo = await Todomodel.findByIdAndUpdate(
            id,
            { title, description },
            { new: true }  
        );

        if (!updatedtodo) {
            return res.status(404).json({ "message": "No todo found with this ID" });
        }

         res.json(updatedtodo);
    } catch (error) {
        console.log(error);
        res.status(500).json({ 'message': error.message });
    }
});

app.delete('/todo/:id',async (req,res)=>{
    try {
        const id=req.params.id;
        const deltodo=await Todomodel.findByIdAndDelete(
            id
        )
        res.status(204).end();

    } catch (error) {
        console.log(error);
        res.status(500).json({ 'message': error.message });
    }
})

const port=8000;
app.listen(port,()=>{
    console.log('server is on the  '+port);
})