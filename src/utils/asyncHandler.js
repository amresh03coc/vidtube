const asyncHandler = (requestHandler) => {
    //we are wrapping it up and the sending it back, not executing it!... 
    //next is middle ware.
    return (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export {asyncHandler}