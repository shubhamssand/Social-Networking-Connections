session.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username',{email:loggedInUser,UserType:loggedInUserType})
    .then(function(result){
        session.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username',{email:connectToUser,UserType:connectToUserType})
        .then(function(final){
            session.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b",{loggedIn:loggedInUser,connectTo:connectToUser})
            .then(function(ress){
                res.end("success");
            })
        })
    
    })
    .catch(function(err){
        console.log("erorr");
        res.end(err);
    })


    session.run('MATCH (a {username:{loggedIn}}) return a.username',{loggedIn:loggedInUser})
    .then(function(result){
         if (result.records[0]._fields.length==1){
             session.run('MATCH (b {username:connectTo}) return b.username',{connectTo:connectToUser})
             .then(function(ress){
                 if(ress.records[0]._fields.length==1){
                     session.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b",{loggedIn:loggedInUser,connectTo:connectToUser})
 
                 }else{
                     session.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username',{email:connectToUser,UserType:connectToUserType})
                     session.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b",{loggedIn:loggedInUser,connectTo:connectToUser})
 
                 }
             })
 
         }else{
             if(session.run('MATCH (a {username:{loggedIn}}) return a.username',{loggedIn:connectToUser})
         ){
 
             }
             session.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username',{email:loggedInUser,UserType:loggedInUserType})
             session.run('CREATE (n:Person {username:{email},type:{UserType}}) RETURN n.username',{email:connectToUser,UserType:connectToUserType})
             session.run("Match (a {username:{loggedIn}}),(b {username:{connectTo}}) MERGE (a)-[:FRIEND]-(b) MERGE (b)-[:FRIEND]-(a) return a,b",{loggedIn:loggedInUser,connectTo:connectToUser})
             
         }
        
    }).catch(function(err){
        res.end("error");
    })




    
    res.end("Hi you are in get");