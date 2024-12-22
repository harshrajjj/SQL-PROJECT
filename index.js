const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');// yha my sql ko require kie hai
const express = require('express');
const app = express();
app.set("view engine","ejs");
const path = require("path");
app.set("views",path.join(__dirname,"/views"));
const methodOverride = require("method-override");
app.use(methodOverride("_method"));
app.use(express.urlencoded({extended:true}));
const { v4: uuidv4 } = require('uuid');

// create the connection yha hum mere mysql k data base se connection lie h
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'delta_app',
    password: 'Harsh123'
  });

  let getrandomUser = () => { // returning array
    return [
        faker.string.uuidv4(),
        faker.internet.username(),
        faker.internet.email(),
        faker.internet.password()
    ];  
}

// try{  // connect jo hmara upar for hui h uske andar query naam ka function hota hai jiska kaam hota hai data base p koi v query run karna uske andar ek query hota h jo hum bhejte hai and ek call back function hota hai jisme argument aaya hai (error,result,field) feild tab aaiga jab hum select query ko use kenge
//     connection.query("SHOW TABLES",(err,result) => {// hum query show database ek variable m v likh sakte hai then uss variable ko yha pass kar denge as an argument
//         if(err)throw err;
//         console.log(result);// result m array aata hai jisme sare table oject k form m rethr hai
//         console.log(result.length);
//         console.log(result[0]);
//         console.log(result[1]);
//       })
//     }catch(err){
//         console.log(err);
        
//     }


  // inserting new data
    // let q="insert into users(id,username,email,password) values ?";// insertion query for multiple user input
    // let users =[
    //     ["123b","123_newuserb","abc@gmail.comb","abcb"],
    //     ["123c","123_newuserc","abc@gmail.comc","abcc"]
    // ];


    // enter data using faker we make a empty arrap and run a loop so that faker push data into array
    // let users =[];
    // for (let i = 0;i<1000;i++){
    //     users.push(getrandomUser());
    // }

    // try{
    //     // [users] is also pass so that data can be interted through the users
    // connection.query(q,[users],(err,result) => {
    //     if(err)throw err;
    //     console.log(result);
    //   })
    // }catch(err){
    //     console.log(err);
        
    // }


    // connection.end(); // ek barr connection bnn jata hai wo stablish he retha h usko end karne k lie hum ye likhte hai



const port = "8080";
// server start
app.listen(port,() =>{
    console.log(`listning on port ${port}`);
});

// home page 
app.get("/",(req,res) => {
    try{
        let q= "select count(*) from users;"
        connection.query(q,(err,result) => {
            if(err) throw err;
            let userCount = result[0]["count(*)"];
            res.render("home.ejs",{userCount})
        })
    }
    catch(err){
        console.log(err);  
        res.send("some error in database");
    }
});

// showing user
app.get("/user",(req,res) => {
    try{
        let q= "select id,username,email from users;"
        connection.query(q,(err,result) => {
            if(err) throw err;
            let users = result;
            res.render("user.ejs",{users});
        })
    }
    catch(err){
        console.log(err);  
        res.send("some error in database");
    }
});


// edit user id
app.get("/user/:id/edit",(req,res) => {
    let {id}=req.params;
    let q = `select * from users where id='${id}'`;
    try{
        connection.query(q,(err,result) => {
            if(err) throw err;
            let user = result[0];
            console.log(user);
            
            res.render("EditForm.ejs",{user})
        })
    }
    catch(err){
        console.log(err);  
        res.send("some error in database");
    }

    
})

app.patch("/user/:id",(req,res) => {
    let {id}=req.params; 
    let {password:formpass,username:newusername} = req.body;
    let q = `select * from users where id='${id}'`;
    try{
        connection.query(q,(err,result) => {
            if(err) throw err;
            let user = result[0];
            if(formpass!=user.password){
                res.send("wrong Password");
            }else{
                let nq=`update users set username='${newusername}' where id = '${id}'`;
                connection.query(nq,(err,result) => {
                    if(err) throw err;
                    res.redirect("/user");
                })
            }
            
        })
    }
    catch(err){
        console.log(err);  
        res.send("some error in database");
    }       
})

// delete the user
app.get("/user/:id/delete",(req,res) => {
    let {id}=req.params;
    let q = `select * from users where id='${id}'`;
    try{
        connection.query(q,(err,result) => {
            if(err) throw err;
            let user = result[0];
            console.log(user);
            res.render("delete.ejs",{user})
        })
    }
    catch(err){
        console.log(err);  
        res.send("some error in database");
    }

    
})


app.delete("/user/:id",(req,res) => {
    let {id}=req.params;
    let {email,password} = req.body;
    try{
        let q= `select * from users where id ='${id}'`
        connection.query(q,(err,result) => {
            let userData=result[0];
            if(err)throw err;
            if(userData.email==email && userData.password==password){
                let nq =`delete from users where id = '${id}'`;
                connection.query(nq,(err,result) => {
                    if(err)throw err;
                    res.redirect("/user");
                })
            }else{
                res.send("Incorrect Password or Email");
            }
        })
    }catch(error){
        console.log(err);
        res.send("Some Error In Data Base");
    }
})

// add new user
app.get("/user/new",(req,res) => {
    res.render("newuser.ejs");
})

app.post("/user",(req,res) => {
    let {email,username,password} = req.body;
    let id = uuidv4();
    let newUser = [[id,username,email,password]];
    let q = "insert into users (id,username,email,password) values ?";
    connection.query(q,[newUser],(err,result) => {
        res.redirect("/user");
    })
})