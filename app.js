const express=require("express");
const mongoose=require("mongoose");
const bodyparser=require("body-parser");

const app=express();
app.set('view engine','ejs');

app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
    name: String
  };
  
  const Item = mongoose.model("Item", itemsSchema);

  const listSchema = {
    name: String,
    items: [itemsSchema]
  }; 
  
  const List = mongoose.model("List", listSchema);
  
let prog=0;
app.get("/",function(req,res){

    List.find({},function(err,found){ 
        if(!err){
            if(!found){
                res.send("you have no list")
            }
            else{
                res.render("demo",{listname:found ,flen:found.length})
            }
        }
    })
    
})
let mwork=0;
app.get("/:custom",function(req,res){
    let custom=req.params.custom;
    List.find({name:custom},function(err,foundlist){
        if(!err){
            if(!foundlist){
                
                res.redirect("/"+custom);
            }
            else{
                List.find({},function(err,founded){
                    if(err){
                        res.send(err)
                    }
                    if(prog>=100){
                        prog=0;
                    }
                res.render("list",{listname:founded,listhead:custom,lists:foundlist,prog:prog});
                })
            }
        }
    })
})

app.post("/gotolist",function(req,res){
    let listn=req.body.listn;
    res.redirect("/"+listn)
})

app.post("/add",function(req,res){
    let ln=req.body.buttonval;
    console.log(ln);
    let t=req.body.value;

    List.findOne({name: ln}, function(err, foundList){
        if(!err){
            if(!foundList){
                console.log("not")
            }
            else{
                const item = new Item({
                    name: t,
                  });
                foundList.items.push(item);
                foundList.save();
                console.log("saved")
                res.redirect("/" + ln); 
            }
        }
    
})


})

app.post("/create",function(req,res){

    let newlistname=req.body.newlistname;
    const item = new Item({
        name: "this",
      });
    const list=new List({
        name:newlistname,
        item:[item],
    })
    list.save()

    res.redirect("/"+newlistname); 
})
let p=0;
mwork=0;
let work=0;
app.post("/delete",function(req,res){
    let checkedItemId=req.body.checkname;
    let listName=req.body.checkedlist;
List.findOne({name: listName}, function(err, foundList){
work=foundList.items.length;
if(work>mwork){
    mwork=foundList.items.length;
}
p=100/mwork;
prog=prog+p;
    if(foundList.items.length==0){
        prog=0;
    }
    if(work==0){
        p=0;
        prog=0;
        mwork=0;
    }
    if(prog>=100){
        prog=0;
    }
    console.log(mwork)
})
List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
    if(err){
        res.send(err);
    }
    if(!foundList){
        res.send("not found");
    }
    else{
        res.redirect("/"+listName);
    }
})
//res.redirect("/"+listName);
})
app.listen(5000,function(){
    console.log("running on 5000");
})

