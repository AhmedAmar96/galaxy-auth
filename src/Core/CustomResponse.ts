interface Response {
    GetResponse: object;
}
export class CustomResponse implements Response{
    private message=null;
    private result=null;
    private status=true;
    constructor(message , data?){
        this.message = message;
        this.result = data
    }
    GetResponse(){  
        if(typeof this.result === 'object')      
            return {status: this.status, message: this.message , data : {...this.result} }
        else{
            return {status: this.status, message: this.message , data : this.result }
        }
    }

}