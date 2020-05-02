//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//Mongo Atlas Server
mongoose.connect("mongodb+srv://mongo_admin:admin@123@nodeapi-vftnw.mongodb.net/todoLists?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })

const itemlistScehma = mongoose.Schema({
  name: String
});

const customListSchema = mongoose.Schema({
  name: String,
  items: [itemlistScehma]
});


const Item = mongoose.model("Item", itemlistScehma);
const List = mongoose.model("List", customListSchema);



const item1 = new Item({
  name: "Plan your Goal today"
});
const item2 = new Item({
  name: "<-- can delete here"
});

const defaultItems = [item1, item2];

var foundItems = [];

app.get("/", function (req, res) {

  const day = date.getDate();
  Item.find(function (err, docs) {
    foundItems = docs;
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err, rows) {
        if (err) {
          console.log(err);
        } else {
          foundItems = rows;
          res.render("list", { listTitle: day, newListItems: foundItems });
        }
      });
    } else {
      res.render("list", { listTitle: day, newListItems: foundItems });
    }
  });
});

app.get("/:customListName", function (req, res) {
  console.log("Calling Get Param!!");

  var customlistName = req.params.customListName;
  const list = new List({
    name: customlistName,
    items: defaultItems
  });

  List.findOne({ name: customlistName }, function (err, doc) {
    if (!err) {
      if (!doc) {
        console.log("Calling Get Param If!!");
        list.save();
        res.redirect("/" + customlistName);
      } else {
        console.log("Calling Get Param else!!");
        res.render("list", { listTitle: customlistName, newListItems: doc.items });
      }
    }
  })
});

app.post("/", function (req, res) {
  console.log("Calling POST!!");

  const customListName = req.body.list;
  const item = new Item({ name: req.body.newItem });
  if (customListName === date.getDate()) {
    console.log("Calling POST If!!");
    item.save();
    res.redirect("/");
  } else {
    ListModel.findOne({ name: customListName }, function (err, doc) {
      if (!err) {
        console.log("Calling POST else!!");
        doc.items.push(item);
        doc.save();
        res.redirect("/" + customListName)
      }
    })
  }
});

app.post("/delete", function (req, res) {
  console.log("Calling Delete!!");

  const checkedId = req.body.checkbox;
  const listName = req.body.listName;
  if (listName === date.getDate()) {
    console.log("Calling Delete if!!");
    Item.findByIdAndDelete(checkedId, function (err) {
      if (!err) {
        console.log("Sucessfully Deleted!");
        res.redirect("/");
      }
    });
  } else {
    console.log("Calling Delete else!!");
    ListModel.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      } else {
        console.log(err);

      }
    })
  }
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started running!!");
});
