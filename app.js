//jshint esversion:6
const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const ejs=require("ejs");
const _=require("lodash");
const app=express();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb+srv://admin-lakshay:gotthegoal@cluster0.jqhum.mongodb.net/todolistdb?retryWrites=true&w=majority",{useNewUrlParser: true,useUnifiedTopology: true});
 const { Schema } = mongoose;
mongoose.set('useFindAndModify', false);
const Itemschema=new Schema({
  name:String
});
const Item=mongoose.model("Item",Itemschema);
const item1=new Item({
  name:"Welcome to your todo-list"
});
const item2=new Item({
  name:"To add a item press on +"
});
const item3=new Item({
  name:"<-- press here to delete item"
});
var defaultitems=[item1,item2,item3];

const Listschema=new Schema({
  name:String,
   listitems:[Itemschema]
})

const List=mongoose.model("List",Listschema);
app.get("/", function(req, res) {
  Item.find({},function(err,results){
  if(results.length==0)
    {

      Item.insertMany(defaultitems,function(err)
      {
        if(err)
        {
          console.log(err);
        }
      });
      res.redirect("/");
    }
    else{




  res.render("list", {listTitle: "Today", newListItems: results});
}
})
});
app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listname=req.body.list;
  const itemadd=new Item({
    name:itemname
  });
if(listname=="Today")
{
  itemadd.save();
  res.redirect("/");
}
  else{
List.findOne({name:listname},function(err,foundlist)
{
foundlist.listitems.push(itemadd);
foundlist.save();
  res.redirect("/"+listname);
});

  }



});


app.post("/delete",function(req,res)
{
  const itemidel=req.body.checkbox;
  const listname=req.body.listname;
if(listname=="Today")
{
  Item.findByIdAndRemove(itemidel,function(err)
{
  if(err)
  {
    console.log(err);
  }
});
res.redirect("/");
}

else{
List.findOneAndUpdate({name:listname},{$pull:{listitems:{_id:itemidel}}},function(err,foundlist)
{
  if(!err)
  {
    res.redirect("/"+listname);
  }
});

}


});

app.get("/:route",function(req,res)
{
  const listname=_.capitalize(req.params.route);
List.findOne({name:listname},function(err,found)
{
  if(err)
  {
    console.log(err);
  }
  else if(!found)
  {
    // create a new list
    const newlist=new List({
      name:listname,
      listitems:defaultitems
    });
    newlist.save();
    res.redirect("/"+listname);
  }
else
{
  // show existing list
    res.render("list", {listTitle: found.name, newListItems: found.listitems});
}

});



})


app.get("/about", function(req, res){
  res.render("about");
});

let port=process.env.PORT;
if(port==NULL || port=="")
{
  port=3000;
}
app.listen(port, function() {
  console.log("Server started on port 3000");
});
