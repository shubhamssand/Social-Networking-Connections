var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var cors = require('cors');
var neo4j=require('neo4j-driver').v1;
app.use(bodyParser.json());


var driver=neo4j.driver('bolt://localhost:7687',neo4j.auth.basic('neo4j','4044'));
var session=driver.session();
app.get('/connections',function(req,res){
    let email=req.query.username;
    console.log("df",email);
    var connections=[];
    var obj={}
session.run('MATCH (a {username:{emailadd}})--(b) return b',{emailadd:email})
    .then(function(res){
        //console.log("hhhhh",res);
        res.records.forEach(function(conn){
            let temp=JSON.stringify(conn);
            console.log(JSON.parse(temp)._fields[0].properties);
            connections.push(JSON.parse(temp)._fields[0].properties.username);
        })
        obj.connections=connections;
        console.log(obj);
        
        //res.send(JSON.stringify(obj));
    })
    .catch(function(err){
        console.log(err);
        res.end("Error in Neo4j Movie Graph");
    })
    res.end("Hi you are in get");
})


app.get('/mutualconnections',function(req,res){
    let email=req.query.username;
    console.log("df",email);
    var connections=[];
    var obj={}
session.run('MATCH (a {username:{emailadd}})--(b)--(c) return c',{emailadd:email})
    .then(function(res){
        //console.log("hhhhh",res);
        res.records.forEach(function(conn){
            let temp=JSON.stringify(conn);
            console.log(JSON.parse(temp)._fields[0].properties);
            connections.push(JSON.parse(temp)._fields[0].properties.username);
        })
        obj.connections=connections;
        console.log("Mutual Friends",obj);
        
        //res.send(JSON.stringify(obj));
    })
    .catch(function(err){
        console.log(err);
        res.end("Error in Neo4j Movie Graph");
    })
    res.end("Hi you are in get");
})
app.post('/addconnection',function(req,res){
    console.log("in add");
    
    let loggedInUser=req.body.loggedInUser.username;
    let connectToUser=req.body.connectToUser.username;
    let loggedInUserType=req.body.loggedInUser.type;
    let connectToUserType=req.body.connectToUser.type;

    const tx = session.beginTransaction();

    async function myFunc() {
        let r1 = await tx.run('MATCH (a {username:{loggedIn}}) return a.username', { loggedIn: loggedInUser });
        console.log(r1);
        if (r1.records.length != 0) {
            let r2 = await tx.run('MATCH (b {username:{connectTo}}) return b.username', { connectTo: connectToUser });
            if (r2.records.length != 0) {
                await tx.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b", { loggedIn: loggedInUser, connectTo: connectToUser })
            }
            else {
                await tx.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username', { email: connectToUser, UserType: connectToUserType })
                await tx.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b", { loggedIn: loggedInUser, connectTo: connectToUser })
            }
        } else {

            await tx.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username', { email: loggedInUser, UserType: loggedInUserType })
            let r3 = await tx.run('MATCH (b {username:{connectTo}}) return b.username', { connectTo: connectToUser })

            if (r3.records.length != 0) {
                await tx.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b", { loggedIn: loggedInUser, connectTo: connectToUser })

            } else {
                await tx.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username', { email: connectToUser, UserType: connectToUserType })
                await tx.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b", { loggedIn: loggedInUser, connectTo: connectToUser })

            }
        }
    }

    myFunc().then(out => {

        }).catch(e => {
            console.log(e);
        })
      
   




    // tx.run('MATCH (a {username:{loggedIn}}) return a.username',{loggedIn:loggedInUser})
    //  .then(result => {
    //      console.log(result.records.length);
    //   if(result.records.length != 0){
    //       if(result.records[0]._fields.length!=0){
    //         tx.run('MATCH (b {username:{connectTo}}) return b.username',{connectTo:connectToUser})
    //         .then(out=>{
    //             if(out.records.length!=0){
    //                 if(out.records[0]._fields.length!=0){
    //                 tx.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b",{loggedIn:loggedInUser,connectTo:connectToUser})

    //                 }else{
    //                     tx.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username',{email:connectToUser,UserType:connectToUserType})
    //                     tx.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b",{loggedIn:loggedInUser,connectTo:connectToUser})

    //                 }
    //             }else{
    //                 console.log("ddd");
    //                 tx.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username',{email:connectToUser,UserType:connectToUserType}).then(o => {
    //                     tx.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b",{loggedIn:loggedInUser,connectTo:connectToUser}).then(o2 => {
    //                       console.log('success');  
    //                     }).catch(e => {
    //                         console.log(e);
    //                     })
    //                 }).catch(e => {
    //                     console.log(e);
    //                 })

    //             }
    //         }).catch(e => {
    //             console.log(e);
    //         })
    //       }
        
    // }else{
    //     console.log("hii");
    //     tx.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username',{email:loggedInUser,UserType:loggedInUserType})

    //     tx.run('MATCH (b {username:{connectTo}}) return b.username',{connectTo:connectToUser})
    //         .then(out=>{
    //             if(out.records.length!=0){
    //                 if(out.records[0]._fields.length!=0){
    //                 tx.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b",{loggedIn:loggedInUser,connectTo:connectToUser})

    //                 }else{
    //                     tx.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username',{email:connectToUser,UserType:connectToUserType})
    //                     tx.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b",{loggedIn:loggedInUser,connectTo:connectToUser})

    //                 }
    //             }else{
    //                 tx.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username',{email:connectToUser,UserType:connectToUserType})
    //                 tx.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b",{loggedIn:loggedInUser,connectTo:connectToUser})

    //             }
    //         })

    // }
    // console.log("xxx");
    // })
    .then(() => {
        // Everything is OK, the transaction will be committed
        tx.commit();
        
    })
    .catch(e => {
         console.log(e);
        // The transaction will be rolled back, now handle the error.
        tx.rollback();
       
    });


    res.end("Hi you are in get");
})
app.listen(3001);
console.log("Server Listening on port 3001");