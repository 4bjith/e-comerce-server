
function AdminCheck(req,res,next){

    console.log("from second middleware",req.user)
    if(req.user.role==="admin"){
        next()
    }else{
        res.status(401).json({message: "Un authorized acess"})
    }
}

export default AdminCheck