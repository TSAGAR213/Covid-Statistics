const express = require('express')
const app = express()
const bodyParser = require("body-parser");
const port = 8080

// Parse JSON bodies (as sent by API clients)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const { connection } = require('./connector')

app.get("/",(req,res)=>{
    res.json({message:"Covid Statistics"})
})

app.post("/add",(req,res)=>{
    let {state,infected,recovered,death}=req.body;
    let newState=new connection({state,infected,recovered,death});
    newState.save()
    .then(data=>{
        res.json({status:'success',data})
    })
    .catch(e=>{
        res.json({status:'error',message:e.message})
    })
   
})

app.get("/totalRecovered",(req,res)=>{
    let totalRecovered=0;
    connection.find()
    .then(data=>{
      data.forEach(details=>{
        totalRecovered+=details['recovered']
      });
      res.json({data:{_id:"total",recovered:totalRecovered}})
    })
    .catch(e=>{
        res.json({status:'error',message:e.message})
    }) 
})

app.get("/totalActive",(req,res)=>{
    let totalActive=0;
    connection.find()
    .then(data=>{
      data.forEach(details=>{
        totalActive+=details['infected']
      });
      res.json({data:{_id:"total",active:totalActive}})
    })
    .catch(e=>{
        res.json({status:'error',message:e.message})
    })  
})

app.get("/totalDeath",(req,res)=>{
    let totalDeath=0;
    connection.find()
    .then(data=>{
      data.forEach(details=>{
        totalDeath+=details['death']
      });
      res.json({data:{_id:"total",death:totalDeath}})
    })
    .catch(e=>{
        res.json({status:'error',message:e.message})
    }) 
})

app.get("/hotspotStates",(req,res)=>{
    let hotspotStates=[]
    connection.find()
    .then(data=>{
        data.forEach(details=>{
            let {state,infected,recovered}=details;
            let rate=((infected - recovered)/infected);
            if(rate>0.1)
            {
             hotspotStates.push({state,rate})
            }
          })
          res.json({data:hotspotStates})
    })
    .catch(e=>{
        res.json({status:'error',message:e.message})
    }) 
})

app.get("/healthyStates",(req,res)=>{
    let healthyStates=[]
    connection.find()
    .then(data=>{
        data.forEach(details=>{
            let {state,infected,death}=details;
            let mortality=((death/infected));
            if(mortality<0.005)
            {
                healthyStates.push({state,mortality})
            }
          })
          res.json({data:healthyStates})
    })
    .catch(e=>{
        res.json({status:'error',message:e.message})
    }) 
})

app.listen(port, () => console.log(`App listening on port ${port}!`))

module.exports = app;