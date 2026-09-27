from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel

app = FastAPI()

class DivisionRequest(BaseModel):
    a: float
    b: float

@app.exception_handler(RequestValidationError)
def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=400,
        content={"error": "a und b müssen Zahlen sein!"}
    )

@app.post("/divide")
def divide(request:DivisionRequest):
    if request.b == 0:
        raise HTTPException(status_code=400, detail="Division durch Null ist nicht erlaubt")
    result = request.a / request.b
    return {"result": result}