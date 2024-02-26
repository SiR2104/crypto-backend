class Errors extends Error
{
    status: number;
    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
    static notFound()
    {
        return new Errors(404, "Api path not found.");
    }
    static badRequest(message?: string)
    {
        return new Errors(403, message ?? "Bad request.");
    }
    static notAuth(message?: string)
    {
        return new Errors(401, message ?? "Please auth.");
    }
    static handleError(error: Errors)
    {
        throw error;
    }
}

export default Errors;