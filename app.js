const express = require("express");
const bodyparser = require("body-parser");
const date= require(__dirname+"/date.js");
const mongoose=require("mongoose");
const app = express();
const _=require("loadash"); //error

app.set('view engine', 'ejs');
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));
mongoose.connect("mongodb://127.0.0.1:27017/todoDB",{useNewUrlParser: true,useUnifiedTopology: true});

let day;
const itemsSchema = {
    name: String
};

const Item =mongoose.model("Item",itemsSchema);

const item1= new Item({
   name: "Welcome to Todolist!!"
});

const item2= new Item({
   name: "Hit + to add a item"
});

const item3= new Item({
   name: "<--Hit this to delete a item."
});

const def=[item1,item2,item3];
const listSchema ={
    name: String,
    items: [itemsSchema]
};

const List= mongoose.model("List",listSchema);



app.get("/", function (req, res) {
    
    Item.find({})
    .then(function(foundItems){
      

        if(foundItems.length===0)
        {
            Item.insertMany(def)
            .then(function(){
               console.log("Default items loaded to db!!!");
              })
              .catch(function(err){
               console.log(err);
              })

              res.redirect("/");
        }
        else
        {
            res.render("list", { kindofDay: day, newListItems: foundItems });

        }
       })
       .catch(function(err){
        console.log(err);
       })
    
    day= date();
    
});

app.get("/:customListName", function(req,res){
    const cname= _.capitalize(req.params.customListName);
    
    List.findOne({name: cname})
    .then(function(foundList){
          if(!foundList)
          {
            const list= new List({
                name: cname,
                items: def
             });
         
             list.save();
             res.redirect("/"+ cname);
          }
          else
          {
            res.render("list", { kindofDay: foundList.name, newListItems: foundList.items});
          }
       })
       .catch(function(err){
        console.log(err);
       })


   
})

app.post("/",function(req,res){{
    const itemName=req.body.newItem;
    const ListName=req.body.list;

    const item = new Item({
        name: itemName
    });

    if(ListName===day){
        item.save();
        res.redirect("/");
    } else{
        List.findOne({name: ListName})
        .then(function(foundList){
            foundList.items.push(item);
            foundList.save();
            res.redirect("/" + ListName);
         })
         .catch(function(err){
            console.log(err);
           })
    }

   
    
    
    
}})

app.post("/delete", function(req,res){
    const checkedItemId=req.body.checkbox;
    const ListName= req.body.listName;

    

    if(ListName===day)
    {
        Item.findByIdAndRemove(checkedItemId)
        .then(function(){
            console.log("Deleted successfully!!!");
            res.redirect("/");
           })
           .catch(function(err){
            console.log(err);
           })
    }
    else
    {
       List.findOneAndUpdate({name: ListName},{$pull: {items: {_id:checkedItemId}}})
       .then(function()
       {
           res.redirect("/"+ ListName);
       })
    }

    
})



app.listen(3000, function () {
    console.log("Server started on port 3000");
});